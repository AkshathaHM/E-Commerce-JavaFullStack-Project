package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.PaymentServiceContract;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class PaymentControllerTest {

    @Test
    void verifyPayment_shouldReturnSpecificErrorForMissingPaymentId() {
        PaymentServiceContract paymentService = mock(PaymentServiceContract.class);
        PaymentController controller = new PaymentController();
        ReflectionTestUtils.setField(controller, "paymentService", paymentService);

        User user = new User();
        user.setUserId(7);
        user.setUsername("alice");

        HttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute("authenticatedUser", user);

        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(
                Map.of("razorpay_order_id", "order_123", "razorpay_signature", "sig"),
                request
        );

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Missing Payment ID", response.getBody().get("error"));
    }
}
