package com.kodnest.app.userservices;

import com.kodnest.app.entities.SharedCart;
import com.kodnest.app.entities.User;

import java.util.List;
import java.util.Map;

public interface SharedCartServiceContract {
    SharedCart createSharedCart(User owner, String title, List<Map<String, Object>> items);
    Map<String, Object> getSharedCartDetails(User viewer, String shareId);
    SharedCart joinSharedCart(User user, String shareId);
    void addOrUpdateSharedCartItem(User user, String shareId, int productId, int quantity);
    void removeSharedCartItem(User user, String shareId, int productId);
}
