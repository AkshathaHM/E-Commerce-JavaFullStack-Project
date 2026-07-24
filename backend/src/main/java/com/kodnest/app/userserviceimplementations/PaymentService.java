package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.userservices.PaymentServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService implements PaymentServiceContract {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${RAZORPAY_KEY_ID:${razorpay_key_id:rzp_test_TAsqtBKY9SkyQb}}")
    private String razorpayKeyId;

    @Value("${RAZORPAY_KEY_SECRET:${razorpay_key_secret:EIUnA86y67xrJsV2Ov3UBTek}}")
    private String razorpayKeySecret;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private RazorpayClient razorpayClient;

    public PaymentService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Lazy init RazorpayClient (only when needed)
    private void initRazorpayClient() throws RazorpayException {
        if (razorpayClient == null) {
            System.out.println("Initializing RazorpayClient with key: " + razorpayKeyId);
            System.out.println("Secret length: " + (razorpayKeySecret != null ? razorpayKeySecret.length() : "null"));
            razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        }
    }

    @Override
    @Transactional
    public String createOrder(int userId, BigDecimal totalAmount, List<OrderItem> orderItems) throws RazorpayException {
        initRazorpayClient();  // init only when called

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).longValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        return razorpayOrder.get("id");
    }

    @Override
    @Transactional
    public Map<String, Object> verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, int userId, BigDecimal totalAmount, List<OrderItem> orderItems) {
        Map<String, Object> response = new LinkedHashMap<>();
        log.info("Received payment data | orderId={}, paymentId={}, signaturePresent={}", razorpayOrderId, razorpayPaymentId, razorpaySignature != null);

        try {
            if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
                response.put("success", false);
                response.put("error", "Missing Order ID");
                return response;
            }
            if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
                response.put("success", false);
                response.put("error", "Missing Payment ID");
                return response;
            }
            if (razorpaySignature == null || razorpaySignature.isBlank()) {
                response.put("success", false);
                response.put("error", "Missing Razorpay Signature");
                return response;
            }
            if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
                response.put("success", false);
                response.put("error", "Secret Key Mismatch");
                return response;
            }

            boolean valid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
            log.info("Signature verification result | orderId={} | paymentId={} | valid={}", razorpayOrderId, razorpayPaymentId, valid);
            if (!valid) {
                response.put("success", false);
                response.put("error", "Invalid Razorpay Signature");
                return response;
            }

            if (orderRepository.existsById(razorpayOrderId)) {
                response.put("success", false);
                response.put("error", "Order Already Exists");
                return response;
            }

            LocalDateTime now = LocalDateTime.now();
            Order order = new Order();
            order.setOrderId(razorpayOrderId);
            order.setUserId(userId);
            order.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
            order.setStatus(OrderStatus.ORDER_PLACED);
            order.setPaymentStatus("PAID");
            order.setPaymentId(razorpayPaymentId);
            order.setRazorpaySignature(razorpaySignature);
            order.setCreatedAt(now);
            order.setUpdatedAt(now);
            orderRepository.save(order);
            log.info("Order saved successfully | orderId={}", razorpayOrderId);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
                orderItemRepository.save(item);
            }

            cartRepository.deleteAllByUserUserId(userId);
            log.info("Cart cleared successfully | userId={}", userId);

            userRepository.findById(userId).ifPresentOrElse(user -> {
                try {
                    emailService.sendOrderConfirmationEmail(user, razorpayOrderId, totalAmount != null ? totalAmount.toPlainString() : "0");
                } catch (Exception emailException) {
                    log.warn("Order confirmation email failed | orderId={} | error={}", razorpayOrderId, emailException.getMessage());
                }
            }, () -> log.warn("User not found while sending confirmation email | userId={}", userId));

            response.put("success", true);
            response.put("message", "Payment verified successfully");
            response.put("orderId", razorpayOrderId);
            response.put("paymentId", razorpayPaymentId);
            response.put("paymentStatus", "PAID");
            response.put("orderStatus", OrderStatus.ORDER_PLACED.name());
            return response;
        } catch (Exception e) {
            log.error("Database save failed during payment verification | orderId={} | paymentId={} | error={}", razorpayOrderId, razorpayPaymentId, e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Database Save Failed: " + e.getMessage());
            return response;
        }
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) throws Exception {
        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        String expected = hex.toString();
        return constantTimeEquals(expected, razorpaySignature.trim());
    }

    private boolean constantTimeEquals(String expected, String received) {
        if (expected == null || received == null) {
            return false;
        }
        if (expected.length() != received.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < expected.length(); i++) {
            result |= expected.charAt(i) ^ received.charAt(i);
        }
        return result == 0;
    }
}