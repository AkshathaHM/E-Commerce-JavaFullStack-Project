package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.PaymentServiceContract;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentServiceContract paymentService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(
            @RequestBody Map<String, Object> requestBody,
            HttpServletRequest request) {

        System.out.println("Received payload: " + requestBody);

        try {
            User user = (User) request.getAttribute("authenticatedUser");
            if (user == null) {
                System.out.println("User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            Object totalAmountObj = requestBody.get("totalAmount");
            System.out.println("totalAmount raw: " + totalAmountObj);
            if (totalAmountObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing totalAmount"));
            }
            BigDecimal totalAmount = new BigDecimal(totalAmountObj.toString());
            System.out.println("Parsed totalAmount: " + totalAmount);

            List<Map<String, Object>> cartItemsRaw = (List<Map<String, Object>>) requestBody.get("cartItems");
            System.out.println("cartItems raw size: " + (cartItemsRaw != null ? cartItemsRaw.size() : "null"));
            if (cartItemsRaw == null || cartItemsRaw.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart items missing or empty"));
            }

            List<OrderItem> orderItems = cartItemsRaw.stream().map(item -> {
                System.out.println("Mapping item: " + item);
                OrderItem oi = new OrderItem();
                oi.setProductId((Integer) item.get("productId"));
                oi.setQuantity((Integer) item.get("quantity"));
                BigDecimal price = new BigDecimal(item.get("price").toString());
                oi.setPricePerUnit(price);
                oi.setTotalPrice(price.multiply(BigDecimal.valueOf(oi.getQuantity())));
                return oi;
            }).collect(Collectors.toList());

            System.out.println("Calling service with amount: " + totalAmount + ", items: " + orderItems.size());
            String razorpayOrderId = paymentService.createOrder(
                    user.getUserId(),
                    totalAmount,
                    orderItems
            );

            Map<String, Object> response = new HashMap();
            response.put("orderId", razorpayOrderId);
            response.put("amountPaise", totalAmount.multiply(BigDecimal.valueOf(100)).longValue());

            System.out.println("Order created successfully: " + razorpayOrderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in createPaymentOrder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating payment order: " + e.getMessage()));
        }
    }
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, Object> requestBody,
            HttpServletRequest request) {

        try {
            User user = (User) request.getAttribute("authenticatedUser");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error", "User not authenticated"));
            }

            String orderId = (String) requestBody.get("razorpay_order_id");
            String paymentId = (String) requestBody.get("razorpay_payment_id");
            String signature = (String) requestBody.get("razorpay_signature");

            if (orderId == null || orderId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing Order ID"));
            }
            if (paymentId == null || paymentId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing Payment ID"));
            }
            if (signature == null || signature.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing Razorpay Signature"));
            }

            Object totalAmountObj = requestBody.get("totalAmount");
            BigDecimal totalAmount = totalAmountObj == null ? null : new BigDecimal(totalAmountObj.toString());

            List<Map<String, Object>> cartItemsRaw = (List<Map<String, Object>>) requestBody.get("cartItems");
            List<OrderItem> orderItems = List.of();
            if (cartItemsRaw != null) {
                orderItems = cartItemsRaw.stream().map(item -> {
                    OrderItem oi = new OrderItem();
                    oi.setProductId((Integer) item.get("productId"));
                    oi.setQuantity((Integer) item.get("quantity"));
                    BigDecimal price = new BigDecimal(item.get("price").toString());
                    oi.setPricePerUnit(price);
                    oi.setTotalPrice(price.multiply(BigDecimal.valueOf(oi.getQuantity())));
                    return oi;
                }).collect(Collectors.toList());
            }

            Map<String, Object> verificationResult = paymentService.verifyPayment(
                    orderId, paymentId, signature, user.getUserId(), totalAmount, orderItems
            );

            boolean success = Boolean.TRUE.equals(verificationResult.get("success"));
            if (success) {
                return ResponseEntity.ok(verificationResult);
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(verificationResult);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Verification error: " + e.getMessage()));
        }
    }
}