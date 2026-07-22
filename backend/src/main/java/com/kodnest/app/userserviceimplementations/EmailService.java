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

import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final Optional<SendGridEmailService> sendGridEmailService;
    private final boolean sendGridEnabled;
    private final String sendGridFromAddress;
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
    private volatile String lastEmailError;

    public EmailService(JavaMailSender mailSender,
                        Optional<SendGridEmailService> sendGridEmailService,
                        @Value("${SENDGRID_API_KEY:}") String sendGridApiKey,
                        @Value("${SENDGRID_FROM_ADDRESS:}") String sendGridFromAddress,
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
        this.sendGridEmailService = sendGridEmailService;
        this.sendGridEnabled = sendGridApiKey != null && !sendGridApiKey.isBlank() && sendGridEmailService.isPresent() && sendGridEmailService.get().isEnabled();
        this.sendGridFromAddress = sendGridFromAddress;
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
        if (sendGridEnabled && sendGridEmailService.isPresent()) {
            try {
                sendGridEmailService.get().sendEmail(to, subject, body);
                logger.info("OTP email sent through SendGrid to {}", to);
                lastEmailError = null;
                return;
            } catch (RuntimeException ex) {
                logger.error("SendGrid email delivery failed for {}: {}", to, ex.getMessage(), ex);
                lastEmailError = "SendGrid email delivery failed: " + ex.getMessage();
                throw ex;
            }
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            logger.info("OTP email sent to {}", to);
            lastEmailError = null;
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
                if (mailPort == 465) {
                    JavaMailSenderImpl fallbackSender = createStartTlsSender();
                    try {
                        logger.info("Attempting fallback Gmail SMTP on alternate port for {}", to);
                        fallbackSender.send(message);
                        logger.info("OTP email sent via fallback port {} to {}", fallbackSender.getPort(), to);
                        lastEmailError = null;
                        return;
                    } catch (MailException fallbackEx) {
                        logger.error("Fallback Gmail SMTP failed for {}: {}", to, fallbackEx.getMessage(), fallbackEx);
                        lastEmailError = userMessage + " Fallback attempt also failed: " + fallbackEx.getMessage();
                        throw new RuntimeException(lastEmailError, fallbackEx);
                    }
                } else {
                    logger.warn("No alternate Gmail SMTP fallback is configured for port {}. Skipping fallback.", mailPort);
                }
            }

            lastEmailError = userMessage;
            throw new RuntimeException(userMessage, ex);
        }
    }

    public String getLastEmailError() {
        return lastEmailError;
    }

    public Map<String, Object> getEmailConfig() {
        return Map.ofEntries(
                Map.entry("emailProvider", sendGridEnabled ? "sendgrid" : "smtp"),
                Map.entry("sendGridEnabled", sendGridEnabled),
                Map.entry("sendGridFromAddress", sendGridFromAddress),
                Map.entry("mailHost", mailHost),
                Map.entry("mailPort", mailPort),
                Map.entry("mailUsername", mailUsername),
                Map.entry("mailAuth", auth),
                Map.entry("mailStarttlsEnabled", starttlsEnabled),
                Map.entry("mailStarttlsRequired", starttlsRequired),
                Map.entry("mailSslTrust", sslTrust),
                Map.entry("mailSslProtocols", sslProtocols),
                Map.entry("fromAddress", fromAddress)
        );
    }

    public Map<String, Object> testSmtpConnection() {
        Map<String, Object> result = new HashMap<>();
        result.put("mailHost", mailHost);
        result.put("mailPort", mailPort);
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(mailHost, mailPort), connectionTimeout);
            result.put("reachable", true);
            result.put("message", "Socket connected successfully to " + mailHost + ":" + mailPort);
        } catch (Exception ex) {
            result.put("reachable", false);
            result.put("message", ex.getClass().getSimpleName() + ": " + ex.getMessage());
        }
        return result;
    }

    private JavaMailSenderImpl createSslSender() {
        JavaMailSenderImpl fallbackSender = new JavaMailSenderImpl();
        fallbackSender.setHost(mailHost);
        fallbackSender.setPort(465);
        fallbackSender.setUsername(mailUsername);
        fallbackSender.setPassword(mailPassword);

        Properties fallbackProps = new Properties();
        fallbackProps.put("mail.transport.protocol", "smtp");
        fallbackProps.put("mail.smtp.auth", String.valueOf(auth));
        fallbackProps.put("mail.smtp.ssl.enable", "true");
        fallbackProps.put("mail.smtp.starttls.enable", "false");
        fallbackProps.put("mail.smtp.starttls.required", "false");
        fallbackProps.put("mail.smtp.socketFactory.fallback", "false");
        fallbackProps.put("mail.smtp.ssl.trust", sslTrust);
        fallbackProps.put("mail.smtp.ssl.protocols", sslProtocols);
        fallbackProps.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        fallbackProps.put("mail.smtp.timeout", String.valueOf(timeout));
        fallbackProps.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));
        fallbackProps.put("mail.smtp.ehlo", "true");
        fallbackProps.put("mail.debug", "false");

        fallbackSender.setJavaMailProperties(fallbackProps);
        return fallbackSender;
    }

    private JavaMailSenderImpl createStartTlsSender() {
        JavaMailSenderImpl fallbackSender = new JavaMailSenderImpl();
        fallbackSender.setHost(mailHost);
        fallbackSender.setPort(587);
        fallbackSender.setUsername(mailUsername);
        fallbackSender.setPassword(mailPassword);

        Properties fallbackProps = new Properties();
        fallbackProps.put("mail.transport.protocol", "smtp");
        fallbackProps.put("mail.smtp.auth", String.valueOf(auth));
        fallbackProps.put("mail.smtp.starttls.enable", "true");
        fallbackProps.put("mail.smtp.starttls.required", "true");
        fallbackProps.put("mail.smtp.ssl.enable", "false");
        fallbackProps.put("mail.smtp.socketFactory.fallback", "false");
        fallbackProps.put("mail.smtp.ssl.trust", sslTrust);
        fallbackProps.put("mail.smtp.ssl.protocols", sslProtocols);
        fallbackProps.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        fallbackProps.put("mail.smtp.timeout", String.valueOf(timeout));
        fallbackProps.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));
        fallbackProps.put("mail.smtp.ehlo", "true");
        fallbackProps.put("mail.debug", "false");

        fallbackSender.setJavaMailProperties(fallbackProps);
        return fallbackSender;
    }
}
