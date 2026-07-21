package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final SendGridEmailService sendGridEmailService;
    private final String fromAddress;
    private final String backendBaseUrl;

    public EmailService(SendGridEmailService sendGridEmailService,
                        @Value("${SPRING_MAIL_USERNAME:}") String fromAddress,
                        @Value("${app.backend.base-url:http://localhost:9090}") String backendBaseUrl) {
        this.sendGridEmailService = sendGridEmailService;
        this.fromAddress = fromAddress;
        this.backendBaseUrl = backendBaseUrl;

        if (fromAddress == null || fromAddress.isBlank()) {
            logger.warn("SendGrid sender address is not configured (SPRING_MAIL_USERNAME is blank)");
        }
    }

    public void sendVerificationEmail(User user, String token) {
        if (user == null || token == null || token.isBlank()) {
            logger.warn("Cannot send verification email: missing user or token");
            return;
        }
        sendGridEmailService.sendVerificationEmail(user, token, backendBaseUrl);
    }

    public void sendOtpEmail(User user, String otp) {
        if (user == null || otp == null || otp.isBlank()) {
            logger.warn("Cannot send OTP email: missing user or OTP");
            return;
        }
        sendGridEmailService.sendOtpEmail(user, otp);
    }
}
