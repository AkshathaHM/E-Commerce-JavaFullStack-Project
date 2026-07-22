package com.kodnest.app.filters;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;

import java.io.IOException;
import java.util.Optional;

@Component
@Order(2) // Ensures this filter runs AFTER GlobalCorsFilter (Order 1)
@WebFilter(urlPatterns = {"/api/*", "/admin/*"})
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final AuthServiceContract authService;
    private final UserRepository userRepository;

    private static final String[] UNAUTHENTICATED_PATHS = {
            "/api/users/register",
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/verify",
            "/api/auth/verify-otp",
            "/api/auth/resend-otp",
            "/api/auth/forgot-password",
            "/api/auth/logout",
            "/api/auth/email-status",
            "/api/auth/email-config",
            "/api/auth/email-smtp-test"
    };

    public AuthenticationFilter(AuthServiceContract authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String requestURI = request.getRequestURI();
        logger.debug("AuthFilter: incoming request {} {} from Origin={}", request.getMethod(), requestURI, request.getHeader("Origin"));

        // 1. Instantly fulfill OPTIONS preflight requests (CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            setCorsHeaders(request, response);
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 2. Skip authentication for public endpoints (Registration & Login)
        if (isUnauthenticatedPath(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Authenticate token from cookie or bearer header
        String token = getAuthToken(request);
        if (token == null) {
            logger.debug("AuthFilter: no token found for request {}", requestURI);
            if (isOptionalAuthPath(requestURI)) {
                chain.doFilter(request, response);
                return;
            }
            sendError(request, response, HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
            return;
        }

        if (!authService.validateToken(token)) {
            logger.debug("AuthFilter: token validation failed for token starting={}...", token.length() > 8 ? token.substring(0, 8) : token);
            if (isOptionalAuthPath(requestURI)) {
                chain.doFilter(request, response);
                return;
            }
            sendError(request, response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or missing token");
            return;
        }

        String username = authService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            sendError(request, response, HttpServletResponse.SC_UNAUTHORIZED, "User not found");
            return;
        }

        User user = userOpt.get();
        Role role = user.getRole();

        // 4. Role check
        if (requestURI.startsWith("/admin/") && role != Role.ADMIN) {
            sendError(request, response, HttpServletResponse.SC_FORBIDDEN, "Admin access required");
            return;
        }

        if (requestURI.startsWith("/api/") && role != Role.CUSTOMER && !requestURI.startsWith("/api/auth")) {
            sendError(request, response, HttpServletResponse.SC_FORBIDDEN, "Customer access required");
            return;
        }

        request.setAttribute("authenticatedUser", user);
        chain.doFilter(request, response);
    }

    private boolean isOptionalAuthPath(String uri) {
        return uri.startsWith("/api/products");
    }

    private boolean isUnauthenticatedPath(String uri) {
        for (String path : UNAUTHENTICATED_PATHS) {
            if (uri.endsWith(path) || uri.contains(path)) {
                return true;
            }
        }
        return false;
    }

    private String getAuthToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        // support alternative headers used by some frontends
        String alt = request.getHeader("X-Auth-Token");
        if (alt != null && !alt.isBlank()) return alt.trim();
        String alt2 = request.getHeader("x-access-token");
        if (alt2 != null && !alt2.isBlank()) return alt2.trim();

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void sendError(HttpServletRequest request, HttpServletResponse response, int status, String message) throws IOException {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
        }

        setCorsHeaders(request, response);
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }

    private void setCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept, Origin, Cookie, Access-Control-Request-Method, Access-Control-Request-Headers");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");
    }
}
