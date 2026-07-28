package com.kodnest.app.usercontrollers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.entities.LoginRequest;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project.vercel.app", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce.javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceContract authService;
    private final UserRepository userRepository;

    public AuthController(AuthServiceContract authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            String token = authService.generateToken(user);

            boolean secureCookie = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
            String cookieValue = "authToken=" + token + "; HttpOnly; Path=/; Max-Age=3600; SameSite=None";
            if (secureCookie) {
                cookieValue += "; Secure";
            }
            response.addHeader("Set-Cookie", cookieValue);

            Map<String, Object> body = new HashMap<>();
            body.put("message", "Login successful");
            body.put("role", user.getRole().name());
            body.put("username", user.getUsername());
            body.put("token", token);

            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = extractTokenFromRequest(request, authHeader);
            if (token != null && authService.validateToken(token)) {
                String username = authService.extractUsername(token);
                User user = new User();
                user.setUsername(username);
                authService.logout(user);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            boolean secureCookie = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
            String cookieValue = "authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=None";
            if (secureCookie) {
                cookieValue += "; Secure";
            }
            response.setHeader("Set-Cookie", cookieValue);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Map<String, String> body = new HashMap<>();
        body.put("message", "Logout successful");
        return ResponseEntity.ok(body);
    }

    private String extractTokenFromRequest(HttpServletRequest request, String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }
        Map<String, Object> body = new HashMap<>();
        body.put("userId", user.getUserId());
        body.put("username", user.getUsername());
        body.put("name", user.getName());
        body.put("email", user.getEmail());
        body.put("role", user.getRole().name());
        body.put("address", user.getAddress());
        body.put("mobileNumber", user.getMobileNumber());
        body.put("password", "********");
        body.put("verified", user.isVerified());
        body.put("enabled", user.isEnabled());
        body.put("createdAt", user.getCreatedAt());
        body.put("updatedAt", user.getUpdatedAt());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String newPassword = body.get("newPassword");

            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Username is required");
            }
            if (newPassword == null || newPassword.isBlank() || newPassword.length() < 8) {
                throw new IllegalArgumentException("New password must be at least 8 characters long");
            }

            var userOpt = userRepository.findByUsername(username.trim());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}