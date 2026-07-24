package com.kodnest.app.userserviceimplementations;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SendGridEmailService {

    private static final Logger logger = LoggerFactory.getLogger(SendGridEmailService.class);

    private final SendGrid sendGrid;
    private final String fromAddress;
    private final String fromName;
    private final boolean enabled;

    public SendGridEmailService(
            @Value("${SENDGRID_API_KEY:}") String sendGridApiKey,
            @Value("${SENDGRID_FROM_ADDRESS:}") String sendGridFromAddress,
            @Value("${SENDGRID_FROM_NAME:Sales Savvy Team}") String sendGridFromName) {
        this.fromAddress = sendGridFromAddress;
        this.fromName = sendGridFromName;
        this.enabled = sendGridApiKey != null && !sendGridApiKey.isBlank() && sendGridFromAddress != null && !sendGridFromAddress.isBlank();
        this.sendGrid = enabled ? new SendGrid(sendGridApiKey) : null;

        if (enabled) {
            logger.info("SendGrid email delivery is enabled using from address {}", fromAddress);
        } else {
            logger.info("SendGrid email delivery is not enabled; set SENDGRID_API_KEY and SENDGRID_FROM_ADDRESS to enable it.");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void sendEmail(String to, String subject, String body) {
        if (!enabled || sendGrid == null) {
            throw new IllegalStateException("SendGrid is not configured");
        }

        Email from = new Email(fromAddress, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/html", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGrid.api(request);
            int statusCode = response.getStatusCode();
            if (statusCode < 200 || statusCode >= 300) {
                throw new RuntimeException("SendGrid send failed with status " + statusCode + ": " + response.getBody());
            }
            logger.info("SendGrid email sent to {} (status={})", to, statusCode);
        } catch (Exception ex) {
            logger.error("Failed to send email through SendGrid to {}: {}", to, ex.getMessage(), ex);
            throw new RuntimeException("SendGrid send failed: " + ex.getMessage(), ex);
        }
    }
}
