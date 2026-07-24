package com.kodnest.app.userservices;

import com.kodnest.app.entities.OrderItem;
import com.razorpay.RazorpayException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PaymentServiceContract {

    String createOrder(int userId, BigDecimal totalAmount, List<OrderItem> orderItems) throws RazorpayException;

    Map<String, Object> verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, int userId, BigDecimal totalAmount, List<OrderItem> orderItems);
}