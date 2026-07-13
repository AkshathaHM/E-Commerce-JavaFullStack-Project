package com.kodnest.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE) // Guarantees this runs BEFORE AuthenticationFilter
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 1. Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        // 2. Allow your Vercel URL and Localhost origins
        config.setAllowedOriginPatterns(List.of(
            "https://e-commerce-java-full-stack-project-*.vercel.app",
            "https://e-commerce-java-full-stack-project-q6xw-iy1w947k3.vercel.app",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000"
        ));

        // 3. Allow all standard HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 4. Allow all headers
        config.setAllowedHeaders(List.of("*"));

        // 5. Cache preflight response for 1 hour to reduce preflight requests
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}