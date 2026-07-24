package com.kodnest.app.userserviceimplementations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public Map<String, Object> getOrdersForUser(User user) {
        List<OrderItem> orderItems = orderItemRepository.findSuccessfulOrderItemsByUserId(user.getUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        List<Map<String, Object>> products = new ArrayList<>();

        for (OrderItem item : orderItems) {
            Order order = item.getOrder();
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null || order == null) {
                continue;
            }

            List<ProductImage> images = productImageRepository.findByProduct_ProductId(product.getProductId());
            String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();
            OrderStatus resolvedStatus = orderLifecycleStatusResolver.resolve(order);

            Map<String, Object> productDetails = new HashMap<>();
            productDetails.put("order_id", order.getOrderId());
            productDetails.put("quantity", item.getQuantity());
            productDetails.put("total_price", item.getTotalPrice());
            productDetails.put("image_url", imageUrl);
            productDetails.put("product_id", product.getProductId());
            productDetails.put("name", product.getName());
            productDetails.put("description", product.getDescription());
            productDetails.put("price_per_unit", item.getPricePerUnit());
            productDetails.put("status", resolvedStatus.name());
            productDetails.put("created_at", order.getCreatedAt());
            productDetails.put("payment_method", "Razorpay");
            productDetails.put("payment_status", "Paid");
            productDetails.put("address", user.getAddress());
            productDetails.put("total_amount", order.getTotalAmount());

            products.add(productDetails);
        }

        response.put("products", products);
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