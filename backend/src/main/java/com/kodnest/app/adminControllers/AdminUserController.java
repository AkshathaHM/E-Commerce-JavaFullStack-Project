package com.kodnest.app.adminControllers;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kodnest.app.adminServices.AdminUserServiceContract;
import com.kodnest.app.entities.User;

@RestController
@RequestMapping("/admin/user")
public class AdminUserController {

    private final AdminUserServiceContract adminUserService;

    public AdminUserController(AdminUserServiceContract adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PutMapping("/modify")
    public ResponseEntity<?> modifyUser(@RequestBody Map<String, Object> userRequest) {
        try {
            // Safely parse userId from String to Integer
            Object userIdObj = userRequest.get("userId");
            Integer userId = userIdObj instanceof Number 
                ? ((Number) userIdObj).intValue() 
                : Integer.parseInt(String.valueOf(userIdObj));

            String username = (String) userRequest.get("username");
            String email = (String) userRequest.get("email");
            String role = (String) userRequest.get("role");

            User updatedUser = adminUserService.modifyUser(userId, username, email, role);

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
            // Safely parse userId from String to Integer
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