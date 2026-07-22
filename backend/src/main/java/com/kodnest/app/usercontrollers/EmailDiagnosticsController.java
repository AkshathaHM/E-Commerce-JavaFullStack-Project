package com.kodnest.app.usercontrollers;

import com.kodnest.app.userserviceimplementations.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "https://e-commerce-java-full-stack-project-five.vercel.app",
                "https://e-commerce-java-full-stack-project-seven.vercel.app"
        },
        allowedHeaders = {"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"},
        allowCredentials = "true"
)
@RequestMapping("/api/auth")
public class EmailDiagnosticsController {

    private final EmailService emailService;

    public EmailDiagnosticsController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/email-status")
    public ResponseEntity<?> getEmailStatus() {
        String lastError = emailService.getLastEmailError();
        if (lastError == null) {
            return ResponseEntity.ok(Map.of("status", "ok", "message", "No recent email errors."));
        }
        return ResponseEntity.ok(Map.of("status", "error", "message", lastError));
    }

    @GetMapping("/email-config")
    public ResponseEntity<?> getEmailConfig() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "config", emailService.getEmailConfig()
        ));
    }

    @GetMapping("/email-smtp-test")
    public ResponseEntity<?> testSmtpConnection() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "result", emailService.testSmtpConnection()
        ));
    }
}
