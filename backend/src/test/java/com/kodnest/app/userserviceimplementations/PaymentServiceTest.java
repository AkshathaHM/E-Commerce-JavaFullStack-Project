package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.kodnest.app.usersrepositaries.PaymentRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(orderRepository, orderItemRepository, cartRepository, userRepository, productRepository, paymentRepository, emailService);
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "EIUnA86y67xrJsV2Ov3UBTek");
    }

    @Test
    void verifyPayment_shouldPropagateUnexpectedRuntimeExceptions() throws Exception {
        when(orderRepository.existsById("order_123")).thenReturn(false);
        User user = new User();
        user.setUserId(7);
        when(userRepository.findById(7)).thenReturn(Optional.of(user));

        Product product = new Product();
        product.setProductId(1);
        product.setStock(1);
        when(productRepository.findById(1)).thenReturn(Optional.of(product));

        OrderItem orderItem = new OrderItem();
        orderItem.setProductId(1);
        orderItem.setQuantity(2);

        String signature = createValidSignature("order_123", "pay_123");

        assertThrows(IllegalStateException.class, () -> paymentService.verifyPayment(
                "order_123",
                "pay_123",
                signature,
                7,
                new BigDecimal("100.00"),
                List.of(orderItem)
        ));
    }

    private String createValidSignature(String orderId, String paymentId) throws Exception {
        String payload = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("EIUnA86y67xrJsV2Ov3UBTek".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}
