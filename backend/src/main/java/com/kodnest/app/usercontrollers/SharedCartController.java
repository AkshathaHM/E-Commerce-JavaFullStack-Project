package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.SharedCart;
import com.kodnest.app.entities.User;
import com.kodnest.app.userserviceimplementations.EmailService;
import com.kodnest.app.userservices.SharedCartServiceContract;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project.vercel.app", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/shared-cart")
public class SharedCartController {

    private final SharedCartServiceContract sharedCartService;
    private final EmailService emailService;

    public SharedCartController(SharedCartServiceContract sharedCartService, EmailService emailService) {
        this.sharedCartService = sharedCartService;
        this.emailService = emailService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createSharedCart(@RequestBody Map<String, Object> request, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String title = request.containsKey("title") && request.get("title") != null ? String.valueOf(request.get("title")) : "Shared Cart";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = request.containsKey("items") && request.get("items") instanceof List ? (List<Map<String, Object>>) request.get("items") : null;
        SharedCart sharedCart = sharedCartService.createSharedCart(user, title, items);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "shareId", sharedCart.getShareId(),
                "title", sharedCart.getTitle(),
                "owner", Map.of(
                        "userId", user.getUserId(),
                        "username", user.getUsername(),
                        "name", user.getName()
                )
        ));
    }

    @PostMapping("/{shareId}/invite")
    public ResponseEntity<?> inviteToSharedCart(@PathVariable String shareId, @RequestBody Map<String, Object> request, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (shareId == null || shareId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Share ID is required."));
        }

        String email = request.containsKey("email") && request.get("email") != null ? String.valueOf(request.get("email")).trim() : null;
        String note = request.containsKey("note") && request.get("note") != null ? String.valueOf(request.get("note")).trim() : "";

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }

        if (!email.contains("@") || email.length() < 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid email address."));
        }

        try {
            emailService.sendSharedCartInviteEmail(user, email, shareId, note);
            return ResponseEntity.ok(Map.of("success", true, "message", "Invite email sent."));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinSharedCart(@RequestBody Map<String, Object> request, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String shareId = request.containsKey("shareId") && request.get("shareId") != null ? String.valueOf(request.get("shareId")) : null;
        if (shareId == null || shareId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Share ID is required."));
        }

        try {
            SharedCart sharedCart = sharedCartService.joinSharedCart(user, shareId);
            return ResponseEntity.ok(Map.of(
                    "shareId", sharedCart.getShareId(),
                    "title", sharedCart.getTitle(),
                    "owner", Map.of(
                            "userId", sharedCart.getOwner().getUserId(),
                            "username", sharedCart.getOwner().getUsername(),
                            "name", sharedCart.getOwner().getName()
                    )
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{shareId}")
    public ResponseEntity<?> getSharedCart(@PathVariable String shareId, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Map<String, Object> response = sharedCartService.getSharedCartDetails(user, shareId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{shareId}/item")
    public ResponseEntity<?> addOrUpdateItem(@PathVariable String shareId, @RequestBody Map<String, Object> request, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object pidObj = request.get("productId");
        Object quantityObj = request.get("quantity");

        if (pidObj == null || quantityObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId and quantity are required."));
        }

        int productId;
        int quantity;
        try {
            productId = Integer.parseInt(String.valueOf(pidObj));
            quantity = Integer.parseInt(String.valueOf(quantityObj));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid productId or quantity."));
        }

        try {
            sharedCartService.addOrUpdateSharedCartItem(user, shareId, productId, quantity);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{shareId}/item")
    public ResponseEntity<?> removeItem(@PathVariable String shareId, @RequestBody Map<String, Object> request, HttpServletRequest req) {
        User user = (User) req.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object pidObj = request.get("productId");
        if (pidObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId is required."));
        }

        int productId;
        try {
            productId = Integer.parseInt(String.valueOf(pidObj));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid productId."));
        }

        try {
            sharedCartService.removeSharedCartItem(user, shareId, productId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }
}
