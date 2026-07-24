package com.kodnest.app.userserviceimplementations;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;

@Component
public class OrderLifecycleStatusResolver {

    @Value("${order.lifecycle.confirmed.delay-minutes:10}")
    private int confirmedDelayMinutes;

    @Value("${order.lifecycle.packed.delay-minutes:20}")
    private int packedDelayMinutes;

    @Value("${order.lifecycle.shipped.delay-minutes:30}")
    private int shippedDelayMinutes;

    @Value("${order.lifecycle.out-for-delivery.delay-minutes:40}")
    private int outForDeliveryDelayMinutes;

    @Value("${order.lifecycle.delivered.delay-minutes:50}")
    private int deliveredDelayMinutes;

    public OrderStatus resolve(Order order) {
        if (order == null || order.getCreatedAt() == null) {
            return OrderStatus.ORDER_PLACED;
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return OrderStatus.CANCELLED;
        }

        long elapsedMinutes = ChronoUnit.MINUTES.between(order.getCreatedAt(), LocalDateTime.now());

        if (elapsedMinutes >= deliveredDelayMinutes) {
            return OrderStatus.DELIVERED;
        }
        if (elapsedMinutes >= outForDeliveryDelayMinutes) {
            return OrderStatus.OUT_FOR_DELIVERY;
        }
        if (elapsedMinutes >= shippedDelayMinutes) {
            return OrderStatus.SHIPPED;
        }
        if (elapsedMinutes >= packedDelayMinutes) {
            return OrderStatus.PACKED;
        }
        if (elapsedMinutes >= confirmedDelayMinutes) {
            return OrderStatus.CONFIRMED;
        }
        return OrderStatus.ORDER_PLACED;
    }
}
