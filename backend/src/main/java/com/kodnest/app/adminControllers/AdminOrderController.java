package com.kodnest.app.adminControllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kodnest.app.adminServices.AdminOrderServiceContract;
import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderStatus;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final AdminOrderServiceContract adminOrderService;

    public AdminOrderController(AdminOrderServiceContract adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Map<String, Object>> orders = adminOrderService.getAllOrdersForAdmin();
            if (orders.isEmpty()) {
                return ResponseEntity.ok(List.of(Map.of("message", "No orders found.")));
            }
            return ResponseEntity.status(HttpStatus.OK).body(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to load orders. Please try again."));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            return ResponseEntity.status(HttpStatus.OK)
                    .body(adminOrderService.getOrdersByStatus(orderStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid order status supplied."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to load orders. Please try again."));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getOrdersAnalytics() {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(adminOrderService.getOrdersAnalytics());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch analytics: " + e.getMessage());
        }
    }
}
