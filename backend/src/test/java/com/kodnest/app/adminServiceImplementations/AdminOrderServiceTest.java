package com.kodnest.app.adminServiceImplementations;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminOrderServiceTest {

    @Test
    void getAllOrdersForAdminIncludesCustomerDetails() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AdminOrderService service = new AdminOrderService(orderRepository, userRepository);

        Order order = new Order();
        order.setOrderId("ORD-100");
        order.setUserId(7);
        order.setStatus(OrderStatus.SUCCESS);
        order.setTotalAmount(new BigDecimal("120.50"));
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        User user = new User();
        user.setUserId(7);
        user.setUsername("jane");
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setMobileNumber("9876543210");
        user.setAddress("3, Main Street");
        user.setRole(Role.CUSTOMER);

        when(orderRepository.findAll()).thenReturn(List.of(order));
        when(userRepository.findById(7)).thenReturn(Optional.of(user));

        List<Map<String, Object>> result = service.getAllOrdersForAdmin();

        assertEquals(1, result.size());
        assertEquals("Jane Doe", result.get(0).get("customerName"));
        assertEquals("jane@example.com", result.get(0).get("customerEmail"));
        assertEquals("9876543210", result.get(0).get("customerMobile"));
    }
}
