package com.kodnest.app.filters;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.AuthServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;

import java.io.IOException;
import java.util.Optional;

@Component
@WebFilter(urlPatterns = {"/api/*", "/admin/*"})
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final AuthServiceContract authService;
    private final UserRepository userRepository;

    private static final String[] UNAUTHENTICATED_PATHS = {
            "/api/users/register",
            "/api/auth/login"
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

        // 1. Let preflight OPTIONS requests pass through immediately
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Skip authentication for public routes (Registration & Login)
        if (isUnauthenticatedPath(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Authenticate token
        String token = getAuthTokenFromCookies(request);

        if (token == null || !authService.validateToken(token)) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or missing token");
            return;
        }

        String username = authService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "User not found");
            return;
        }

        User user = userOpt.get();
        Role role = user.getRole();

        // 4. Role Authorization
        if (requestURI.startsWith("/admin/") && role != Role.ADMIN) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Admin access required");
            return;
        }

        if (requestURI.startsWith("/api/") && role != Role.CUSTOMER) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Customer access required");
            return;
        }

        request.setAttribute("authenticatedUser", user);
        chain.doFilter(request, response);
    }

    private boolean isUnauthenticatedPath(String uri) {
        for (String path : UNAUTHENTICATED_PATHS) {
            if (uri.endsWith(path)) {
                return true;
            }
        }
        return false;
    }

    private String getAuthTokenFromCookies(HttpServletRequest request) {
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

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}