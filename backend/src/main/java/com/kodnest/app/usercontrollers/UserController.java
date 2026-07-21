package com.kodnest.app.usercontrollers;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private final UserServiceContract userService;

    public UserController(UserServiceContract userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(
                Map.of(
                    "message", "Registration successful. Please verify your email.",
                    "user", Map.of(
                        "username", registeredUser.getUsername(),
                        "email", registeredUser.getEmail()
                    )
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}