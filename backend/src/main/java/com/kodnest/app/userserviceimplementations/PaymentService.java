package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.entities.Payment;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.PaymentServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.kodnest.app.usersrepositaries.PaymentRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;
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
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    private RazorpayClient razorpayClient;

    public PaymentService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
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

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            throw new IllegalArgumentException("Missing Order ID");
        }
        if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
            throw new IllegalArgumentException("Missing Payment ID");
        }
        if (razorpaySignature == null || razorpaySignature.isBlank()) {
            throw new IllegalArgumentException("Missing Razorpay Signature");
        }
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Secret Key Mismatch");
        }

        boolean valid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        log.info("Signature verification result | orderId={} | paymentId={} | valid={}", razorpayOrderId, razorpayPaymentId, valid);
        if (!valid) {
            throw new IllegalArgumentException("Invalid Razorpay Signature");
        }

        if (orderRepository.existsById(razorpayOrderId)) {
            throw new IllegalStateException("Order Already Exists");
        }

        if (orderItems == null || orderItems.isEmpty()) {
            throw new IllegalArgumentException("No cart items were provided for checkout");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for payment verification"));

        LocalDateTime now = LocalDateTime.now();
        log.info("Payment Verified | orderId={} | paymentId={}", razorpayOrderId, razorpayPaymentId);

        Order order = new Order();
        order.setOrderId(razorpayOrderId);
        order.setUserId(userId);
        order.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
        order.setStatus(OrderStatus.SUCCESS);
        order.setPaymentStatus("PAID");
        order.setPaymentId(razorpayPaymentId);
        order.setRazorpaySignature(razorpaySignature);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        orderRepository.save(order);
        log.info("Saving Order | orderId={}", razorpayOrderId);

        for (OrderItem item : orderItems) {
            if (item == null) {
                throw new IllegalArgumentException("Encountered a null order item");
            }
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid quantity for order item");
            }
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found for id=" + item.getProductId()));
            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product " + product.getProductId());
            }
            item.setOrder(order);
            orderItemRepository.save(item);
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
        log.info("Saving Order Items | orderId={} | itemCount={}", razorpayOrderId, orderItems.size());

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setPaymentId(razorpayPaymentId);
        payment.setAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
        payment.setStatus("PAID");
        payment.setCreatedAt(now);
        paymentRepository.save(payment);
        log.info("Saving Payment | orderId={} | paymentId={}", razorpayOrderId, razorpayPaymentId);

        cartRepository.deleteAllByUserUserId(userId);
        log.info("Clearing Cart | userId={}", userId);

        try {
            emailService.sendOrderConfirmationEmail(user, razorpayOrderId, totalAmount != null ? totalAmount.toPlainString() : "0");
        } catch (Exception emailException) {
            log.warn("Order confirmation email failed | orderId={} | error={}", razorpayOrderId, emailException.getMessage(), emailException);
        }

        response.put("success", true);
        response.put("message", "Payment verified successfully");
        response.put("orderId", razorpayOrderId);
        response.put("paymentId", razorpayPaymentId);
        response.put("paymentStatus", "PAID");
        response.put("orderStatus", OrderStatus.SUCCESS.name());
        log.info("Transaction Committed | orderId={} | paymentId={}", razorpayOrderId, razorpayPaymentId);
        return response;
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
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
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to verify Razorpay signature", ex);
        }
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