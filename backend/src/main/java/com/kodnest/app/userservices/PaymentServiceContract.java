package com.kodnest.app.userservices;

import com.kodnest.app.entities.OrderItem;
import com.razorpay.RazorpayException;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentServiceContract {

    String createOrder(int userId, BigDecimal totalAmount, List<OrderItem> orderItems) throws RazorpayException;

    boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, int userId);
}