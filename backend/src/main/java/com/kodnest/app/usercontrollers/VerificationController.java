package com.kodnest.app.usercontrollers;

import java.util.Map;

import com.kodnest.app.entities.User;
import com.kodnest.app.userserviceimplementations.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        try {
            User verifiedUser = verificationService.verifyToken(token);
            return ResponseEntity.ok(Map.of(
                    "message", "Email verified successfully",
                    "username", verifiedUser.getUsername(),
                    "email", verifiedUser.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Verification failed"));
        }
    }
}
