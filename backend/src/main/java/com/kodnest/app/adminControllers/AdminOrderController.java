package com.kodnest.app.adminControllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kodnest.app.adminServices.AdminOrderServiceContract;
import com.kodnest.app.entities.OrderStatus;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final AdminOrderServiceContract adminOrderService;

    public AdminOrderController(AdminOrderServiceContract adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(adminOrderService.getAllOrders());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch orders: " + e.getMessage());
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
                    .body("Invalid order status: " + status);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch orders: " + e.getMessage());
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
