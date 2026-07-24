package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.PaymentServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService implements PaymentServiceContract {

    @Value("${razorpay_key_id}")
    private String razorpayKeyId;

    @Value("${razorpay_key_secret}")
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
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, int userId, BigDecimal totalAmount, List<OrderItem> orderItems) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            boolean valid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
            if (!valid) return false;

            if (orderRepository.existsById(razorpayOrderId)) {
                return false;
            }

            Order order = new Order();
            order.setOrderId(razorpayOrderId);
            order.setUserId(userId);
            order.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
            order.setStatus(OrderStatus.SUCCESS);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
                orderItemRepository.save(item);
            }

            cartRepository.deleteAllByUserUserId(userId);

            userRepository.findById(userId).ifPresent(user -> {
                emailService.sendOrderConfirmationEmail(user, razorpayOrderId, totalAmount != null ? totalAmount.toPlainString() : "0");
            });

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}