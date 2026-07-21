package com.kodnest.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host:smtp.gmail.com}") String host,
            @Value("${spring.mail.port:465}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.protocol:smtp}") String protocol,
            @Value("${spring.mail.properties.mail.smtp.auth:true}") boolean auth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}") boolean starttls,
            @Value("${spring.mail.properties.mail.smtp.starttls.required:false}") boolean starttlsRequired,
            @Value("${spring.mail.properties.mail.smtp.ssl.enable:true}") boolean sslEnable,
            @Value("${spring.mail.properties.mail.smtp.ssl.trust:smtp.gmail.com}") String sslTrust,
            @Value("${spring.mail.properties.mail.smtp.connectiontimeout:20000}") int connectionTimeout,
            @Value("${spring.mail.properties.mail.smtp.timeout:20000}") int timeout,
            @Value("${spring.mail.properties.mail.smtp.writetimeout:20000}") int writeTimeout
    ) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setProtocol(protocol);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", protocol);
        props.put("mail.smtp.auth", String.valueOf(auth));
        props.put("mail.smtp.starttls.enable", String.valueOf(starttls));
        props.put("mail.smtp.starttls.required", String.valueOf(starttlsRequired));
        props.put("mail.smtp.ssl.enable", String.valueOf(sslEnable));
        props.put("mail.smtp.ssl.trust", sslTrust);
        props.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        props.put("mail.smtp.timeout", String.valueOf(timeout));
        props.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));

        logger.info("Configured JavaMailSender with host={} port={} ssl={} starttls={} auth={}", host, port, sslEnable, starttls, auth);
        if (username == null || username.isBlank()) {
            logger.warn("SPRING_MAIL_USERNAME is not configured");
        }
        if (password == null || password.isBlank()) {
            logger.warn("SPRING_MAIL_PASSWORD is not configured");
        }

        return mailSender;
    }
}
