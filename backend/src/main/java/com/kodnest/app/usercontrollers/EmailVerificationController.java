package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.OtpVerificationRequest;
import com.kodnest.app.entities.ResendOtpRequest;
import com.kodnest.app.entities.User;
import com.kodnest.app.userserviceimplementations.EmailOtpService;
import com.kodnest.app.userserviceimplementations.EmailService;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:5174",
                "http://localhost:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5173",
                "https://e-commerce-java-full-stack-project-five.vercel.app",
                "https://e-commerce-java-full-stack-project-seven.vercel.app",
                "https://e-commerce-javafullstack-project-2.onrender.com"
        },
        allowedHeaders = {"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"},
        allowCredentials = "true"
)
@RequestMapping("/api/auth")
public class EmailVerificationController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailOtpService emailOtpService;

    public EmailVerificationController(UserRepository userRepository,
                                       EmailService emailService,
                                       EmailOtpService emailOtpService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Email not found"));

            if (user.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already verified"));
            }

            emailOtpService.verifyOtp(request.getEmail(), request.getOtp(), user);
            user.setVerified(true);
            user.setEnabled(true);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody ResendOtpRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Email not found"));

            if (user.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already verified"));
            }

            String otp = emailOtpService.generateOtpForEmail(user);
            emailService.sendOtpEmail(user, otp);
            return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
