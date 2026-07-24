package com.kodnest.app.adminServiceImplementations;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminOrderServiceContract;
import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.OrderRepository;
import com.kodnest.app.usersrepositaries.UserRepository;

@Service
public class AdminOrderService implements AdminOrderServiceContract {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminOrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Map<String, Object>> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream().map(order -> {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getOrderId());
            orderMap.put("userId", order.getUserId());
            orderMap.put("status", order.getStatus());
            orderMap.put("totalAmount", order.getTotalAmount());
            orderMap.put("createdAt", order.getCreatedAt());
            orderMap.put("updatedAt", order.getUpdatedAt());

            userRepository.findById(order.getUserId()).ifPresent(user -> {
                orderMap.put("customerName", user.getName() != null && !user.getName().isBlank() ? user.getName() : user.getUsername());
                orderMap.put("customerEmail", user.getEmail());
                orderMap.put("customerMobile", user.getMobileNumber());
                orderMap.put("customerAddress", user.getAddress());
                orderMap.put("customerRole", user.getRole() != null ? user.getRole().name() : null);
            });

            // Include order items for detailed view
            if (order.getOrderitems() != null && !order.getOrderitems().isEmpty()) {
                List<Map<String, Object>> itemsList = order.getOrderitems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("id", item.getId());
                        itemMap.put("productId", item.getProductId());
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("pricePerUnit", item.getPricePerUnit());
                        itemMap.put("totalPrice", item.getTotalPrice());
                        return itemMap;
                    })
                    .toList();
                orderMap.put("items", itemsList);
            } else {
                orderMap.put("items", List.of());
            }

            return orderMap;
        }).toList();
    }

    @Override
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public Map<String, Object> getOrdersAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<Order> allOrders = getAllOrders();
        int totalOrders = allOrders.size();

        long successfulOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.SUCCESS)
                .count();

        long failedOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.FAILED)
                .count();

        long pendingOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING)
                .count();

        analytics.put("totalOrders", totalOrders);
        analytics.put("successfulOrders", successfulOrders);
        analytics.put("failedOrders", failedOrders);
        analytics.put("pendingOrders", pendingOrders);
        analytics.put("successRate", totalOrders > 0 ? (successfulOrders * 100.0) / totalOrders : 0);

        return analytics;
    }
}
