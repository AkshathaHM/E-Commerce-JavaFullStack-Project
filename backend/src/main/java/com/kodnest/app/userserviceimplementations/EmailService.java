package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String backendBaseUrl;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final String mailPassword;
    private final int connectionTimeout;
    private final int timeout;
    private final int writeTimeout;
    private final boolean auth;
    private final boolean starttlsEnabled;
    private final boolean starttlsRequired;
    private final String sslTrust;
    private final String sslProtocols;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.host:smtp.gmail.com}") String mailHost,
                        @Value("${spring.mail.port:587}") int mailPort,
                        @Value("${spring.mail.username:}") String fromAddress,
                        @Value("${spring.mail.password:}") String mailPassword,
                        @Value("${spring.mail.properties.mail.smtp.connectiontimeout:5000}") int connectionTimeout,
                        @Value("${spring.mail.properties.mail.smtp.timeout:5000}") int timeout,
                        @Value("${spring.mail.properties.mail.smtp.writetimeout:5000}") int writeTimeout,
                        @Value("${spring.mail.properties.mail.smtp.auth:true}") boolean auth,
                        @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}") boolean starttlsEnabled,
                        @Value("${spring.mail.properties.mail.smtp.starttls.required:true}") boolean starttlsRequired,
                        @Value("${spring.mail.properties.mail.smtp.ssl.trust:smtp.gmail.com}") String sslTrust,
                        @Value("${spring.mail.properties.mail.smtp.ssl.protocols:TLSv1.2}") String sslProtocols,
                        @Value("${app.backend.base-url:http://localhost:10000}") String backendBaseUrl) {
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.mailPort = mailPort;
        this.fromAddress = fromAddress;
        this.mailUsername = fromAddress;
        this.mailPassword = mailPassword;
        this.connectionTimeout = connectionTimeout;
        this.timeout = timeout;
        this.writeTimeout = writeTimeout;
        this.auth = auth;
        this.starttlsEnabled = starttlsEnabled;
        this.starttlsRequired = starttlsRequired;
        this.sslTrust = sslTrust;
        this.sslProtocols = sslProtocols;
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

            String userMessage = "Failed to send email. ";
            if (ex.getMessage() != null && ex.getMessage().contains("Couldn't connect to host")) {
                userMessage += "SMTP connection failed, check your Gmail SMTP settings, network access, and app password.";
            } else if (ex.getMessage() != null && ex.getMessage().contains("Connection timed out")) {
                userMessage += "Connection timed out to smtp.gmail.com:587. Verify network access and firewall rules.";
            } else {
                userMessage += ex.getMessage();
            }

            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl javaMailSender = (JavaMailSenderImpl) mailSender;
                if (mailPort == 587 && !sslTrust.isBlank()) {
                    try {
                        logger.info("Attempting fallback SMTP SSL on port 465 for {}", to);
                        javaMailSender.setPort(465);
                        Properties props = javaMailSender.getJavaMailProperties();
                        props.put("mail.smtp.socketFactory.port", "465");
                        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                        props.put("mail.smtp.ssl.enable", "true");
                        props.put("mail.smtp.starttls.enable", "false");
                        props.put("mail.smtp.starttls.required", "false");
                        javaMailSender.setJavaMailProperties(props);
                        javaMailSender.send(message);
                        logger.info("OTP email sent via fallback port 465 to {}", to);
                        return;
                    } catch (MailException fallbackEx) {
                        logger.error("Fallback SMTP SSL failed for {}: {}", to, fallbackEx.getMessage(), fallbackEx);
                        userMessage += " Fallback to SMTP SSL on port 465 also failed.";
                    } finally {
                        javaMailSender.setPort(mailPort);
                    }
                }
            }

            throw new RuntimeException(userMessage, ex);
        }
    }
}
