package com.kodnest.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MailConfig {

    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    public MailConfig() {
        logger.info("SMTP email delivery is enabled; SendGrid-specific configuration has been removed.");
    }
}
