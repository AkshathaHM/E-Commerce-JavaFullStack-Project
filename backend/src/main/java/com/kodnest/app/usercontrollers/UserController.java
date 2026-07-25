package com.kodnest.app.usercontrollers;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin; // Add this import
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.kodnest.app.entities.RegisterRequest;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.UserServiceContract;

@RestController
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://e-commerce-java-full-stack-project-five.vercel.app",
        "https://e-commerce-java-full-stack-project-seven.vercel.app"
    },
    allowedHeaders = {"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"},
    allowCredentials = "true"
)
@RequestMapping("/api/users")
public class UserController {
    private UserServiceContract userService;
    private final com.kodnest.app.usersrepositaries.UserRepository userRepository;

    public UserController(UserServiceContract userService, com.kodnest.app.usersrepositaries.UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PutMapping("/modify")
    public ResponseEntity<?> modifyCurrentUser(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        try {
            User authUser = (User) request.getAttribute("authenticatedUser");
            if (authUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Fetch latest from DB
            Integer userId = authUser.getUserId();
            User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

            String username = (String) requestBody.get("username");
            String email = (String) requestBody.get("email");
            String mobile = (String) requestBody.get("mobileNumber");
            String address = (String) requestBody.get("address");

            boolean changed = false;
            if (username != null && !username.isBlank() && !username.equals(user.getUsername())) { user.setUsername(username); changed = true; }
            if (email != null && !email.isBlank() && !email.equals(user.getEmail())) { user.setEmail(email); changed = true; }
            if (mobile != null && !mobile.isBlank() && !mobile.equals(user.getMobileNumber())) { user.setMobileNumber(mobile); changed = true; }
            if (address != null && !address.isBlank() && !address.equals(user.getAddress())) { user.setAddress(address); changed = true; }

            if (!changed) {
                return ResponseEntity.badRequest().body(Map.of("error", "No changes detected"));
            }

            user.setUpdatedAt(java.time.LocalDateTime.now());
            User saved = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", saved.getUserId());
            response.put("username", saved.getUsername());
            response.put("email", saved.getEmail());
            response.put("mobileNumber", saved.getMobileNumber());
            response.put("address", saved.getAddress());
            response.put("role", saved.getRole().name());
            response.put("enabled", saved.isEnabled());
            response.put("createdAt", saved.getCreatedAt());
            response.put("updatedAt", saved.getUpdatedAt());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update profile"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(
                Map.of(
                    "message", "User registered successfully",
                    "user", registeredUser
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}