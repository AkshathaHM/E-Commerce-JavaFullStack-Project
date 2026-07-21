package com.kodnest.app.userserviceimplementations;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.kodnest.app.entities.JWToken;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;
import com.kodnest.app.usersrepositaries.JWTokenRepository;
import com.kodnest.app.usersrepositaries.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService implements AuthServiceContract {

    private final Key SIGNING_KEY;
    private final UserRepository userRepository;
    private final JWTokenRepository jwtTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JWTokenRepository jwtTokenRepository,
            @Value("${jwt.secret}") String jwtSecret) {

        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();

        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 64) {
            throw new IllegalArgumentException(
                "JWT_SECRET must be at least 64 bytes (512 bits). Current length: " + secretBytes.length
            );
        }

        this.SIGNING_KEY = Keys.hmacShaKeyFor(secretBytes);
    }

    @Override
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }
        if (!user.isEnabled()) {
            throw new RuntimeException("User account is not enabled");
        }
        return user;
    }

    @Override
    public String generateToken(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        LocalDateTime now = LocalDateTime.now();

        // Check for existing valid token
        JWToken existing = jwtTokenRepository.findByUserId(user.getUserId());
        if (existing != null && now.isBefore(existing.getExpiresAt())) {
            return existing.getToken();
        }

        // Generate and save new one
        String newToken = generateNewToken(user);

        // Clean up old one if exists
        if (existing != null) {
            jwtTokenRepository.delete(existing);
        }

        saveToken(user, newToken);

        return newToken;
    }

    // ──────────────────────────────────────────────
    //  These two were in the interface → make public
    // ──────────────────────────────────────────────
    @Override
    public String generateNewToken(User user) {
        long expirationMs = 3_600_000L; // 1 hour

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(SIGNING_KEY)
                .compact();
    }

    @Override
    public void saveToken(User user, String token) {
        if (user == null || token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Cannot save token: user or token is null/empty");
        }

        LocalDateTime expiry = LocalDateTime.now().plusSeconds(3600); // consistent with 1h

        JWToken jwtToken = new JWToken(user, token, expiry);
        jwtTokenRepository.save(jwtToken);
    }

    @Override
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            Jwts.parserBuilder()
                    .setSigningKey(SIGNING_KEY)
                    .build()
                    .parseClaimsJws(token);

            Optional<JWToken> stored = jwtTokenRepository.findByToken(token);
            return stored.isPresent() && stored.get().getExpiresAt().isAfter(LocalDateTime.now());

        } catch (Exception e) {
            // log if needed: logger.debug("Token validation failed", e);
            return false;
        }
    }

    @Override
    public String extractUsername(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SIGNING_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    @Override
    public void logout(User user) {
        if (user == null) {
            return;
        }

        JWToken token = jwtTokenRepository.findByUserId(user.getUserId());
        if (token != null) {
            jwtTokenRepository.deleteByUserId(user.getUserId());
            // or: jwtTokenRepository.delete(token);
        }
    }
}