# Forgot Password - Backend API (Spring Boot)

When a user uses **Forgot Password** and submits a new password, the backend must **replace the old password** with the new one in the database. If the user does **not** use Forgot Password, nothing should happen.

## Endpoint

**POST** `/api/auth/forgot-password`

## Request Body

```json
{
  "username": "string",
  "newPassword": "string"
}
```

## Backend Behavior

1. Find the user by `username` (works for both ADMIN and CUSTOMER)
2. **Delete/replace** the old password and **store** the new password (hashed)
3. Return HTTP 200 on success

## Spring Boot Implementation

### 1. Add Controller

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");

        if (username == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid request. Password must be at least 6 characters."));
        }

        // Find user by username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Replace old password with new (hashed) - UPDATE in database
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
```

### 2. CORS Configuration (if frontend runs on different port)

If you get CORS errors, add this to your Spring Boot app:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5174")  // Vite dev server
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowCredentials(true)
            .allowedHeaders("*");
    }
}
```

Or in `application.properties`:

```properties
# If using Spring Security
# Add allowed origins in your SecurityConfig
```

### 3. Security Config (allow forgot-password without auth)

Ensure `/api/auth/forgot-password` is **permitted** for anonymous users:

```java
http.authorizeRequests()
    .antMatchers("/api/auth/login", "/api/auth/forgot-password", "/api/users/register").permitAll()
    // ... other rules
```

## Summary

- **Only when user uses Forgot Password** → Update password in DB
- **Otherwise** → No change
- **Password** → Must be hashed (BCrypt) before storing
