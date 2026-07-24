package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.*;
import com.kodnest.app.usersrepositaries.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private OrderLifecycleStatusResolver orderLifecycleStatusResolver;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getOrdersForUser_shouldReturnBackendResolvedLifecycleStatus() {
        User user = new User();
        user.setUserId(7);
        user.setUsername("alice");
        user.setRole(Role.CUSTOMER);
        user.setAddress("123 Main Street");

        Order order = new Order();
        order.setOrderId("order-123");
        order.setUserId(7);
        order.setTotalAmount(new BigDecimal("1599.00"));
        order.setStatus(OrderStatus.SUCCESS);
        order.setCreatedAt(LocalDateTime.now().minusMinutes(5));
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

        ProductImage image = new ProductImage();
        image.setImageUrl("https://cdn.example.com/mouse.png");
        image.setProduct(product);

        Page<OrderItem> page = new PageImpl<>(List.of(orderItem), PageRequest.of(0, 5), 1);

        when(orderItemRepository.findOrderItemsByUserId(eq(7), any(Pageable.class))).thenReturn(page);
        when(productRepository.findAllById(List.of(42))).thenReturn(List.of(product));
        when(productImageRepository.findByProduct_ProductIdIn(List.of(42))).thenReturn(List.of(image));
        when(orderLifecycleStatusResolver.resolve(order)).thenReturn(OrderStatus.ORDER_PLACED);

        Map<String, Object> response = orderService.getOrdersForUser(user, 0, 5);
        List<Map<String, Object>> orders = (List<Map<String, Object>>) response.get("orders");

        assertEquals(1, orders.size());
        assertEquals("ORDER_PLACED", orders.get(0).get("status"));
        assertEquals("https://cdn.example.com/mouse.png", orders.get(0).get("image_url"));
        assertEquals(1L, response.get("totalElements"));

        verify(productRepository).findAllById(List.of(42));
        verify(productImageRepository).findByProduct_ProductIdIn(List.of(42));
    }
}
