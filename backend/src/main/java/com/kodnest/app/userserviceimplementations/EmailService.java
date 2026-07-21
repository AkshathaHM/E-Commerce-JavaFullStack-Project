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
                        @Value("${app.backend.base-url:http://localhost:10000}") String backendBaseUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.backendBaseUrl = backendBaseUrl;

        if (fromAddress == null || fromAddress.isBlank()) {
            logger.warn("SMTP sender address is not configured (spring.mail.username is blank)");
        }
    }

    public void sendVerificationEmail(User user, String token) {
        if (user == null || token == null || token.isBlank()) {
            logger.warn("Cannot send verification email: missing user or token");
            return;
        }
        String verificationLink = String.format("%s/api/auth/verify?token=%s", backendBaseUrl, token);
        String subject = "Verify your Sales Savvy account";
        String body = "Hi " + user.getUsername() + ",\n\n"
                + "Thank you for registering on Sales Savvy. Please verify your email by clicking the link below:\n\n"
                + verificationLink + "\n\n"
                + "If you did not register, please ignore this message.\n\n"
                + "Regards,\nSales Savvy Team";

        sendEmail(user.getEmail(), subject, body);
    }

    public void sendOtpEmail(User user, String otp) {
        if (user == null || otp == null || otp.isBlank()) {
            logger.warn("Cannot send OTP email: missing user or OTP");
            return;
        }

        String subject = "Your Sales Savvy OTP code";
        String body = "Hi " + user.getUsername() + ",\n\n"
                + "Your verification code is: " + otp + "\n\n"
                + "This code is valid for 5 minutes.\n\n"
                + "If you did not register, please ignore this message.\n\n"
                + "Regards,\nSales Savvy Team";

        sendEmail(user.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            logger.info("OTP email sent to {}", to);
        } catch (MailException ex) {
            logger.error("Failed to send email to {}: {}", to, ex.getMessage(), ex);
            throw new RuntimeException("Failed to send email: " + ex.getMessage(), ex);
        }
    }
}
