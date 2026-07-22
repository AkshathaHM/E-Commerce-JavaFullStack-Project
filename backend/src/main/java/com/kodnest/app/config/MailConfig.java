package com.kodnest.app.config;

import java.util.Optional;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class MailConfig {

    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    public MailConfig() {
        logger.info("SMTP email delivery is enabled; SendGrid-specific configuration has been removed.");
    }

    @Bean
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host:smtp.gmail.com}") String host,
            @Value("${spring.mail.port:587}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.protocol:smtp}") String protocol,
            @Value("${spring.mail.properties.mail.smtp.auth:true}") String auth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}") String starttlsEnable,
            @Value("${spring.mail.properties.mail.smtp.starttls.required:true}") String starttlsRequired,
            @Value("${spring.mail.properties.mail.smtp.connectiontimeout:10000}") String connectionTimeout,
            @Value("${spring.mail.properties.mail.smtp.timeout:10000}") String timeout,
            @Value("${spring.mail.properties.mail.smtp.writetimeout:10000}") String writeTimeout,
            @Value("${spring.mail.properties.mail.smtp.ssl.trust:smtp.gmail.com}") String sslTrust,
            @Value("${spring.mail.properties.mail.smtp.ssl.protocols:TLSv1.2}") String sslProtocols,
            @Value("${SPRING_MAIL_PORT:#{null}}") Optional<Integer> springMailPort,
            @Value("${EMAIL_PASSWORD:}") String envEmailPassword,
            @Value("${EMAIL_USERNAME:}") String envEmailUsername) {
        if (springMailPort.isPresent()) {
            logger.info("Render env override detected: SPRING_MAIL_PORT={}", springMailPort.get());
            port = springMailPort.get();
        }
        if (!envEmailUsername.isBlank()) {
            username = envEmailUsername;
            logger.info("Render env override detected: EMAIL_USERNAME is set");
        }
        if (!envEmailPassword.isBlank()) {
            password = envEmailPassword;
            logger.info("Render env override detected: EMAIL_PASSWORD is set");
        }
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        if ("smtp.gmail.com".equalsIgnoreCase(host) && port == 465 && "true".equalsIgnoreCase(starttlsEnable)) {
            logger.warn("Gmail STARTTLS is enabled but spring.mail.port is 465; switching to port 587 for STARTTLS.");
            mailSender.setPort(587);
        } else {
            mailSender.setPort(port);
        }
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setProtocol(protocol);

        Properties properties = mailSender.getJavaMailProperties();
        properties.put("mail.transport.protocol", protocol);
        properties.put("mail.smtp.auth", auth);
        properties.put("mail.smtp.starttls.enable", starttlsEnable);
        properties.put("mail.smtp.starttls.required", starttlsRequired);
        properties.put("mail.smtp.ssl.enable", "true".equalsIgnoreCase(starttlsEnable) ? "false" : "true");
        properties.put("mail.smtp.socketFactory.fallback", "false");
        properties.put("mail.smtp.connectiontimeout", connectionTimeout);
        properties.put("mail.smtp.timeout", timeout);
        properties.put("mail.smtp.writetimeout", writeTimeout);
        properties.put("mail.smtp.ssl.trust", sslTrust);
        properties.put("mail.smtp.ssl.protocols", sslProtocols);
        properties.put("mail.smtp.ehlo", "true");
        properties.put("mail.debug", "false");

        return mailSender;
    }
}
