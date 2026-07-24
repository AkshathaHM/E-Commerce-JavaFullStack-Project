package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.OrderServiceContract;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderServiceContract orderService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void getOrdersForUserShouldExposeOrdersArrayToClient() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        User user = new User();
        user.setUserId(7);
        user.setUsername("demo");
        user.setRole(Role.CUSTOMER);

        when(request.getAttribute("authenticatedUser")).thenReturn(user);
        when(orderService.getOrdersForUser(user)).thenReturn(Map.of(
                "products", List.of(Map.of("order_id", "ORD-100"))
        ));

        ResponseEntity<Map<String, Object>> response = orderController.getOrdersForUser(request);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().containsKey("orders"));
        assertEquals(1, ((List<?>) response.getBody().get("orders")).size());
    }
}
