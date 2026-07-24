package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.*;
import com.kodnest.app.usersrepositaries.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceLifecycleTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void getOrdersForUser_shouldResolveOrderPlacedForFreshPayment() {
        User user = new User();
        user.setUserId(7);
        user.setUsername("alice");
        user.setRole(Role.CUSTOMER);

        Order order = new Order();
        order.setOrderId("order-123");
        order.setUserId(7);
        order.setTotalAmount(new BigDecimal("1599.00"));
        order.setStatus(OrderStatus.ORDER_PLACED);
        order.setCreatedAt(LocalDateTime.now().minusMinutes(2));
        order.setUpdatedAt(LocalDateTime.now());

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProductId(42);
        orderItem.setQuantity(1);
        orderItem.setPricePerUnit(new BigDecimal("1599.00"));
        orderItem.setTotalPrice(new BigDecimal("1599.00"));

        Product product = new Product();
        product.setProductId(42);
        product.setName("Wireless Mouse");
        product.setDescription("Ergonomic mouse");

        when(orderItemRepository.findSuccessfulOrderItemsByUserId(7)).thenReturn(List.of(orderItem));
        when(productRepository.findById(42)).thenReturn(Optional.of(product));
        when(productImageRepository.findByProduct_ProductId(42)).thenReturn(List.of());

        Map<String, Object> response = orderService.getOrdersForUser(user);
        List<Map<String, Object>> products = (List<Map<String, Object>>) response.get("products");

        assertEquals(1, products.size());
        assertEquals("ORDER_PLACED", products.get(0).get("status"));
    }
}
