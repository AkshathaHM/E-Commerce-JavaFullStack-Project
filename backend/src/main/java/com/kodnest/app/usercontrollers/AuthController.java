package com.kodnest.app.usercontrollers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.entities.LoginRequest;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceContract authService;

    public AuthController(AuthServiceContract authService) {
        this.authService = authService;
    }

    @CrossOrigin(
        origins = "*", 
        allowedHeaders = "*", 
        methods = {"POST", "OPTIONS"},
        allowCredentials = "true",
        exposedHeaders = "*"
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            String token = authService.generateToken(user);

            Cookie cookie = new Cookie("authToken", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);        // Change to true when using HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(3600);
            // Remove domain for cross-origin (important!)
            // cookie.setDomain("localhost");  ← COMMENT THIS LINE

            response.addCookie(cookie);

            Map<String, Object> body = new HashMap<>();
            body.put("message", "Login successful");
            body.put("role", user.getRole().name());
            body.put("username", user.getUsername());

            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        Map<String, String> body = new HashMap<>();
        body.put("message", "Logout successful");
        return ResponseEntity.ok(body);
    }
}