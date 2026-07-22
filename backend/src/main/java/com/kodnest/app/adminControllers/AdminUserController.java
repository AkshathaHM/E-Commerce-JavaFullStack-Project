package com.kodnest.app.adminControllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kodnest.app.adminServices.AdminUserServiceContract;
import com.kodnest.app.entities.User;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/admin/user")
public class AdminUserController {

    private final AdminUserServiceContract adminUserService;

    public AdminUserController(AdminUserServiceContract adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = adminUserService.getAllUsers();
            return ResponseEntity.status(HttpStatus.OK).body(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch users: " + e.getMessage());
        }
    }

    @PostMapping("/request-email-update-otp")
    public ResponseEntity<?> requestEmailUpdateOtp(@RequestBody Map<String, Object> request) {
        try {
            Object userIdObj = request.get("userId");
            Integer userId = userIdObj instanceof Number
                ? ((Number) userIdObj).intValue()
                : Integer.parseInt(String.valueOf(userIdObj));
            String newEmail = (String) request.get("newEmail");

            adminUserService.requestEmailChangeOtp(userId, newEmail);
            return ResponseEntity.ok(Map.of("message", "OTP sent to " + newEmail));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId format");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PutMapping("/modify")
    public ResponseEntity<?> modifyUser(@RequestBody Map<String, Object> userRequest) {
        try {
            Object userIdObj = userRequest.get("userId");
            Integer userId = userIdObj instanceof Number
                ? ((Number) userIdObj).intValue()
                : Integer.parseInt(String.valueOf(userIdObj));

            String username = (String) userRequest.get("username");
            String email = (String) userRequest.get("email");
            String role = (String) userRequest.get("role");
            String otp = (String) userRequest.get("otp");

            User updatedUser = adminUserService.modifyUser(userId, username, email, role, otp);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", updatedUser.getUserId());
            response.put("username", updatedUser.getUsername());
            response.put("email", updatedUser.getEmail());
            response.put("role", updatedUser.getRole().name());
            response.put("createdAt", updatedUser.getCreatedAt());
            response.put("updatedAt", updatedUser.getUpdatedAt());

            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId format");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/getbyid")
    public ResponseEntity<?> getUserById(@RequestBody Map<String, Object> userRequest) {
        try {
            Object userIdObj = userRequest.get("userId");
            Integer userId = userIdObj instanceof Number 
                ? ((Number) userIdObj).intValue() 
                : Integer.parseInt(String.valueOf(userIdObj));

            User user = adminUserService.getUserById(userId);
            return ResponseEntity.status(HttpStatus.OK).body(user);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId format");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
}