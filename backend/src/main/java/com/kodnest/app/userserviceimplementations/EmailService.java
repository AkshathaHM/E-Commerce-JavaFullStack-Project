package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String backendBaseUrl;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromAddress,
                        @Value("${app.backend.base-url:http://localhost:9090}") String backendBaseUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.backendBaseUrl = backendBaseUrl;
    }

    public void sendVerificationEmail(User user, String token) {
        if (user == null || token == null || token.isBlank()) {
            logger.warn("Cannot send verification email: missing user or token");
            return;
        }

        String verificationLink = String.format("%s/api/auth/verify?token=%s", backendBaseUrl, token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Verify your Sales Savvy account");
        message.setText("Hi " + user.getUsername() + ",\n\n" +
                "Thank you for registering on Sales Savvy. Please verify your email by clicking the link below:\n\n" +
                verificationLink + "\n\n" +
                "If you did not register, please ignore this message.\n\n" +
                "Regards,\nSales Savvy Team");

        try {
            mailSender.send(message);
            logger.info("Verification email sent to {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
            logger.info("Verification link (fallback): {}", verificationLink);
        }
    }

    public void sendOtpEmail(User user, String otp) {
        if (user == null || otp == null || otp.isBlank()) {
            logger.warn("Cannot send OTP email: missing user or OTP");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(user.getEmail());
        message.setSubject("Your Sales Savvy email verification OTP");
        message.setText("Hi " + user.getUsername() + ",\n\n" +
                "Thank you for registering on Sales Savvy. Your verification code is:\n\n" +
                otp + "\n\n" +
                "This code is valid for 5 minutes.\n\n" +
                "If you did not register, please ignore this message.\n\n" +
                "Regards,\nSales Savvy Team");

        try {
            mailSender.send(message);
            logger.info("OTP email sent to {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            logger.info("OTP code for {} is {}", user.getEmail(), otp);
            throw new RuntimeException("Failed to send OTP email. Please check the email settings or try again later.");
        }
    }
}
