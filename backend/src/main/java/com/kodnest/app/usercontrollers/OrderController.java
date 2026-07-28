package com.kodnest.app.usercontrollers;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.OrderServiceContract;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project.vercel.app", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce.javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderServiceContract orderService;

    public OrderController(OrderServiceContract orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrdersForUser(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            User authenticatedUser = (User) request.getAttribute("authenticatedUser");
            if (authenticatedUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            Map<String, Object> response = new LinkedHashMap<>(orderService.getOrdersForUser(authenticatedUser, page, size));
            Object orders = response.get("orders");
            if (orders instanceof java.util.List<?> list) {
                response.put("products", list);
            } else {
                response.put("orders", java.util.List.of());
                response.put("products", java.util.List.of());
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @PutMapping("/{orderId}/cancel")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable String orderId, HttpServletRequest request) {
        System.out.println("[OrderController] Received cancel request for order: " + orderId);

        try {
            User authenticatedUser = (User) request.getAttribute("authenticatedUser");
            if (authenticatedUser == null) {
                System.out.println("[OrderController] No authenticated user found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "User not authenticated. Please log in and try again.",
                    "code", "UNAUTHORIZED"
                ));
            }

            if (authenticatedUser.getUserId() == null) {
                System.out.println("[OrderController] Authenticated user has no userId");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Invalid user session. Please log in again.",
                    "code", "INVALID_SESSION"
                ));
            }

            System.out.println("[OrderController] Calling orderService.cancelOrder() for user: " + authenticatedUser.getUserId());
            boolean cancelled = orderService.cancelOrder(orderId, authenticatedUser.getUserId());

            if (cancelled) {
                System.out.println("[OrderController] Order cancelled successfully");
                return ResponseEntity.ok(Map.of(
                    "message", "Order cancelled successfully",
                    "orderId", orderId,
                    "status", "CANCELLED"
                ));
            } else {
                System.out.println("[OrderController] Cancellation returned false");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "This order cannot be cancelled",
                    "code", "CANNOT_CANCEL"
                ));
            }

        } catch (IllegalArgumentException e) {
            System.out.println("[OrderController] IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "ORDER_NOT_FOUND"
            ));

        } catch (IllegalStateException e) {
            System.out.println("[OrderController] IllegalStateException: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", e.getMessage(),
                "code", "CANNOT_CANCEL"
            ));

        } catch (Exception e) {
            System.out.println("[OrderController] Unexpected exception: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unable to process cancel request";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", errorMsg,
                "code", "INTERNAL_ERROR"
            ));
        }
    }
}