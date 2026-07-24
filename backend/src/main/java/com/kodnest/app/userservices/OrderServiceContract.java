package com.kodnest.app.userservices;

import java.util.Map;

import com.kodnest.app.entities.User;

public interface OrderServiceContract {
  Map<String, Object> getOrdersForUser(User user, int page, int size);
  boolean cancelOrder(String orderId, int userId);
}
