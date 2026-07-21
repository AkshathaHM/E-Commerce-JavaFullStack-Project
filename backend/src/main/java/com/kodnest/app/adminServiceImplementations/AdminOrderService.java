package com.kodnest.app.adminServiceImplementations;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminOrderServiceContract;
import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.usersrepositaries.OrderRepository;

@Service
public class AdminOrderService implements AdminOrderServiceContract {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
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
