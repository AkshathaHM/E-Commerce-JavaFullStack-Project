package com.kodnest.app.usercontrollers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.entities.LoginRequest;
import com.kodnest.app.entities.RegisterRequest;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;
import com.kodnest.app.userservices.UserServiceContract;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin(
        allowedOriginPatterns = {
                "http://localhost:5174",
                "http://localhost:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5173",
                "https://*.vercel.app",
                "https://e-commerce-javafullstack-project-2.onrender.com"
        },
        allowedHeaders = {"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"},
        allowCredentials = "true"
)
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceContract authService;

    private final UserServiceContract userService;

    public AuthController(AuthServiceContract authService, UserServiceContract userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful. Please verify your email.",
                    "username", registeredUser.getUsername(),
                    "email", registeredUser.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            String token = authService.generateToken(user);

            boolean isLocalhost = request.getServerName().equals("localhost") || request.getServerName().equals("127.0.0.1");
            boolean secure = !isLocalhost && request.isSecure();
            String sameSiteValue = secure ? "None" : "Lax";

            ResponseCookie authCookie = ResponseCookie.from("authToken", token)
                    .httpOnly(true)
                    .secure(secure)
                    .sameSite(sameSiteValue)
                    .path("/")
                    .maxAge(3600)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, authCookie.toString());

            Map<String, Object> body = new HashMap<>();
            body.put("message", "Login successful");
            body.put("role", user.getRole().name());
            body.put("username", user.getUsername());
            body.put("name", user.getName());
            body.put("token", token);

            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        try {
            ResponseCookie deleteCookie = ResponseCookie.from("authToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

            Map<String, String> body = new HashMap<>();
            body.put("message", "Logout successful");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Logout failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}