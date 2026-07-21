package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SendGridEmailService {

    private static final Logger logger = LoggerFactory.getLogger(SendGridEmailService.class);

    private final SendGrid sendGrid;
    private final String fromAddress;

    public SendGridEmailService(@Value("${SENDGRID_API_KEY:}") String apiKey,
                                @Value("${SPRING_MAIL_USERNAME:}") String fromAddress) {
        this.fromAddress = fromAddress;
        this.sendGrid = new SendGrid(apiKey);

        if (apiKey == null || apiKey.isBlank()) {
            logger.warn("SENDGRID_API_KEY is not configured");
        }
        if (fromAddress == null || fromAddress.isBlank()) {
            logger.warn("SPRING_MAIL_USERNAME is not configured");
        }
    }

    public void sendEmail(String to, String subject, String body) {
        Email from = new Email(fromAddress);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        Personalization personalization = new Personalization();
        personalization.addTo(toEmail);
        mail.addPersonalization(personalization);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            com.sendgrid.Response response = sendGrid.api(request);
            int statusCode = response.getStatusCode();
            if (statusCode >= 200 && statusCode < 300) {
                logger.info("SendGrid email sent to {} with status {}", to, statusCode);
            } else {
                logger.error("SendGrid email failed to {} with status {}: {}", to, statusCode, response.getBody());
                throw new RuntimeException("SendGrid email failed with status " + statusCode + ": " + response.getBody());
            }
        } catch (IOException ex) {
            logger.error("SendGrid email error to {}", to, ex);
            throw new RuntimeException("SendGrid email error: " + ex.getMessage(), ex);
        }
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

    public void sendVerificationEmail(User user, String token, String backendBaseUrl) {
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
}
