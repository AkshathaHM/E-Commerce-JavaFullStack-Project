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
@CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/auth")
public class RegistrationController {
    private final UserServiceContract userService;

    public RegistrationController(UserServiceContract userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(
                Map.of(
                    "message", "User registered successfully",
                    "user", registeredUser
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
