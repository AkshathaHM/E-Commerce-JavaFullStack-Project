package com.kodnest.app.userserviceimplementations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.OrderServiceContract;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.kodnest.app.usersrepositaries.ProductImageRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;

@Service
public class OrderService implements OrderServiceContract {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    private final OrderLifecycleStatusResolver orderLifecycleStatusResolver;

    public OrderService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            OrderLifecycleStatusResolver orderLifecycleStatusResolver) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.orderLifecycleStatusResolver = orderLifecycleStatusResolver;
    }

    @Override
    public Map<String, Object> getOrdersForUser(User user, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 20);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<OrderItem> orderItemPage = orderItemRepository.findOrderItemsByUserId(user.getUserId(), pageable);
        List<OrderItem> orderItems = orderItemPage.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalElements", orderItemPage.getTotalElements());
        response.put("totalPages", orderItemPage.getTotalPages());
        response.put("hasNext", orderItemPage.hasNext());

        List<Map<String, Object>> orders = new ArrayList<>();
        if (orderItems.isEmpty()) {
            response.put("orders", orders);
            return response;
        }

        List<Integer> productIds = orderItems.stream()
                .map(OrderItem::getProductId)
                .distinct()
                .toList();

        Map<Integer, Product> productsById = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getProductId, Function.identity()));

        Map<Integer, String> firstImageByProductId = productImageRepository.findByProduct_ProductIdIn(productIds).stream()
                .filter(image -> image != null && image.getProduct() != null && image.getProduct().getProductId() != null)
                .collect(Collectors.toMap(
                        image -> image.getProduct().getProductId(),
                        ProductImage::getImageUrl,
                        (first, second) -> first,
                        HashMap::new));

        for (OrderItem item : orderItems) {
            Order order = item.getOrder();
            Product product = productsById.get(item.getProductId());
            if (product == null || order == null) {
                continue;
            }

            OrderStatus resolvedStatus = orderLifecycleStatusResolver.resolve(order);
            String imageUrl = firstImageByProductId.getOrDefault(product.getProductId(), null);

            Map<String, Object> orderDetails = new HashMap<>();
            orderDetails.put("order_id", order.getOrderId());
            orderDetails.put("quantity", item.getQuantity());
            orderDetails.put("total_price", item.getTotalPrice());
            orderDetails.put("image_url", imageUrl);
            orderDetails.put("product_id", product.getProductId());
            orderDetails.put("name", product.getName());
            orderDetails.put("description", product.getDescription());
            orderDetails.put("price_per_unit", item.getPricePerUnit());
            orderDetails.put("status", resolvedStatus.name());
            orderDetails.put("created_at", order.getCreatedAt());
            orderDetails.put("payment_method", "Razorpay");
            orderDetails.put("payment_status", "Paid");
            orderDetails.put("address", user.getAddress());
            orderDetails.put("total_amount", order.getTotalAmount());

            orders.add(orderDetails);
        }

        response.put("orders", orders);
        return response;
    }

    @Override
    @Transactional
    public boolean cancelOrder(String orderId, int userId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getUserId() != userId) {
            return false;
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return true;
        }

        OrderStatus resolvedStatus = orderLifecycleStatusResolver.resolve(order);
        if (resolvedStatus == OrderStatus.OUT_FOR_DELIVERY || resolvedStatus == OrderStatus.DELIVERED) {
            return false;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        return true;
    }
}