package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

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
    private final String frontendBaseUrl;
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
    private final com.kodnest.app.usersrepositaries.SharedCartRepository sharedCartRepository;
    private final com.kodnest.app.usersrepositaries.SharedCartInviteRepository sharedCartInviteRepository;

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
                        @Value("${app.backend.base-url:http://localhost:10000}") String backendBaseUrl,
                        @Value("${app.frontend.base-url:${APP_FRONTEND_BASE_URL:}}") String frontendBaseUrl,
                        com.kodnest.app.usersrepositaries.SharedCartRepository sharedCartRepository,
                        com.kodnest.app.usersrepositaries.SharedCartInviteRepository sharedCartInviteRepository) {
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
        this.frontendBaseUrl = frontendBaseUrl != null ? frontendBaseUrl : "";
        this.sharedCartRepository = sharedCartRepository;
        this.sharedCartInviteRepository = sharedCartInviteRepository;

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
        String body = buildHtmlTemplate(
                "Verify your account",
                "Hi " + user.getUsername() + ",",
                "Thank you for registering with Sales Savvy. Please verify your account by clicking the button below.",
                verificationLink,
                "Verify Account"
        );

        sendEmail(user.getEmail(), subject, body);
    }

    public void sendOtpEmail(User user, String otp) {
        if (user == null || otp == null || otp.isBlank()) {
            logger.warn("Cannot send OTP email: missing user or OTP");
            return;
        }

        String subject = "Your Sales Savvy verification code";
        String body = buildHtmlTemplate(
                "Verify your email",
                "Hi " + user.getUsername() + ",",
                "Use the verification code below to complete your signup. This code is valid for 3 minutes.",
                null,
                otp,
                true
        );

        sendEmail(user.getEmail(), subject, body);
    }

    public void sendOrderConfirmationEmail(User user, String orderId, String orderTotal) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String subject = "Order confirmed - Sales Savvy";
        String body = buildHtmlTemplate(
                "Order confirmed",
                "Hi " + user.getUsername() + ",",
                "Your order " + orderId + " has been confirmed and is being prepared for dispatch.",
                null,
                "Total paid: ₹" + orderTotal,
                true
        );
        sendEmail(user.getEmail(), subject, body);
    }

    public void sendOutForDeliveryEmail(User user, String orderId) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String subject = "Your order is out for delivery";
        String body = buildHtmlTemplate(
                "Out for delivery",
                "Hi " + user.getUsername() + ",",
                "Your order " + orderId + " is on the way and will be delivered shortly.",
                null,
                "Track your order from the Orders page",
                true
        );
        sendEmail(user.getEmail(), subject, body);
    }

    public void sendDeliveredEmail(User user, String orderId) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String subject = "Your order has been delivered";
        String body = buildHtmlTemplate(
                "Delivered",
                "Hi " + user.getUsername() + ",",
                "Your order " + orderId + " has been delivered successfully. We hope you enjoy your purchase.",
                null,
                "Thank you for shopping with Sales Savvy",
                true
        );
        sendEmail(user.getEmail(), subject, body);
    }

    public void sendSharedCartInviteEmail(User inviter, String recipientEmail, String shareId, String note) {
        if (inviter == null || recipientEmail == null || recipientEmail.isBlank() || shareId == null || shareId.isBlank()) {
            throw new IllegalArgumentException("Missing invite data.");
        }

        // persist invite record so only invited users can join
        var sharedCartOpt = sharedCartRepository.findByShareId(shareId);
        sharedCartOpt.ifPresent(sharedCart -> {
            var invite = new com.kodnest.app.entities.SharedCartInvite(sharedCart, recipientEmail, inviter);
            sharedCartInviteRepository.save(invite);
        });

        String base = (frontendBaseUrl != null && !frontendBaseUrl.isBlank()) ? frontendBaseUrl : backendBaseUrl;
        String inviteLink = String.format("%s/shared-cart/%s", base.replaceAll("/+$", ""), shareId);
        String subject = inviter.getUsername() + " invited you to join a shared cart on Sales Savvy";
        String message = "You have been invited to collaborate on a shared cart.";
        if (note != null && !note.isBlank()) {
            message += "<br/><br/><strong>Message from " + inviter.getUsername() + ":</strong><br/>" + note;
        }

        // Include plain fallback link and the share id so recipients can use it directly
        message += "<br/><br/>If the button does not work, open this link in your browser:<br/>"
            + "<a href=\"" + inviteLink + "\">" + inviteLink + "</a>"
            + "<br/><small>Share ID: " + shareId + "</small>";

        String body = buildHtmlTemplate(
            "Shared cart invite",
            "Hi there,",
            message,
            inviteLink,
            "Open shared cart"
        );

        sendEmail(recipientEmail, subject, body);
    }

    public void sendOrderCancelledEmail(User user, String orderId) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String subject = "Order cancelled - Sales Savvy";
        String body = buildHtmlTemplate(
                "Order cancelled",
                "Hi " + user.getUsername() + ",",
                "Your order " + orderId + " has been cancelled as requested.",
                null,
                "If this was not intended, please contact support",
                true
        );
        sendEmail(user.getEmail(), subject, body);
    }

    private String buildHtmlTemplate(String heading, String greeting, String message, String actionUrl, String actionText) {
        return buildHtmlTemplate(heading, greeting, message, actionUrl, actionText, false);
    }

    private String buildHtmlTemplate(String heading, String greeting, String message, String actionUrl, String actionText, boolean isCodeStyle) {
        String actionBlock = actionUrl == null ? "" : "<p style=\"margin: 28px 0 12px; text-align:center;\">"
            + "<a href=\"" + actionUrl + "\" style=\"background-color:#1f6feb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600;\">" + actionText + "</a>"
            + "</p>";

        String codeBlock = isCodeStyle ? "<div style=\"display:inline-block;background:#f3f4f6;padding:12px 16px;border-radius:8px;font-size:24px;letter-spacing:4px;font-weight:700;color:#111827;\">" + actionText + "</div>" : "";

        // Professional layout with header, content block, and footer with support note
        return "<div style=\"font-family:Helvetica,Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px 12px;\">"
            + "<div style=\"max-width:680px;margin:0 auto;\">"
            + "<div style=\"background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(15,23,42,0.06);box-shadow:0 6px 18px rgba(2,6,23,0.04);\">"
            + "<div style=\"padding:20px 24px;border-bottom:1px solid rgba(15,23,42,0.04);\">"
            + "<div style=\"display:flex;align-items:center;gap:12px;\">"
            + "<div style=\"width:40px;height:40px;border-radius:8px;background:#1f6feb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;\">SS</div>"
            + "<div> <strong style=\"font-size:16px;color:#0f172a;\">" + heading + "</strong> <div style=\"font-size:13px;color:#475569;\">Sales Savvy</div></div>"
            + "</div></div>"
            + "<div style=\"padding:20px 24px;\">"
            + "<p style=\"margin:0 0 12px;color:#0f172a;font-size:15px;\">" + greeting + "</p>"
            + "<div style=\"color:#334155;font-size:14px;line-height:1.6;\">" + message + "</div>"
            + actionBlock
            + codeBlock
            + "</div>"
            + "<div style=\"padding:16px 24px;border-top:1px solid rgba(15,23,42,0.04);font-size:13px;color:#64748b;\">"
            + "<p style=\"margin:0 0 6px;\">If you need help, reply to this email or visit our support page.</p>"
            + "<p style=\"margin:0;color:#94a3b8;\">Regards,<br/>Sales Savvy Team</p>"
            + "</div>"
            + "</div>"
            + "</div></div>";
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

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
            logger.info("OTP email sent to {}", to);
            lastEmailError = null;
        } catch (MessagingException ex) {
            logger.error("Failed to prepare HTML email for {}: {}", to, ex.getMessage(), ex);
            lastEmailError = "Failed to prepare email: " + ex.getMessage();
            throw new RuntimeException(lastEmailError, ex);
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
