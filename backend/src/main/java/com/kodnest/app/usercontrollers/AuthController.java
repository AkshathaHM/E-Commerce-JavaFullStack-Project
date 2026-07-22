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
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceContract authService;

    public AuthController(AuthServiceContract authService) {
        this.authService = authService;
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

            boolean secureCookie = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
            String cookieValue = "authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=None";
            if (secureCookie) {
                cookieValue += "; Secure";
            }
            response.addHeader("Set-Cookie", cookieValue);

            Map<String, String> body = new HashMap<>();
            body.put("message", "Logout successful");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Logout failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private String extractTokenFromRequest(HttpServletRequest request, String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        javax.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (javax.servlet.http.Cookie cookie : cookies) {
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
        body.put("username", user.getUsername());
        body.put("name", user.getName());
        body.put("email", user.getEmail());
        body.put("role", user.getRole().name());
        body.put("address", user.getAddress());
        return ResponseEntity.ok(body);
    }

}