package com.kodnest.app.adminServices;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;
import java.util.List;
import java.util.Map;

public interface AdminOrderServiceContract {

    public List<Order> getAllOrders();

    public List<Order> getOrdersByStatus(OrderStatus status);

    public Map<String, Object> getOrdersAnalytics();
}
