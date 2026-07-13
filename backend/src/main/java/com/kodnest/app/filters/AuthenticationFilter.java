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
import java.util.Arrays;
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

        if (Arrays.asList(UNAUTHENTICATED_PATHS).contains(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // CORS Preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            setCorsHeaders(response);
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

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

        if (requestURI.startsWith("/admin/") && role != Role.ADMIN) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Admin access required");
            return;
        }

        request.setAttribute("authenticatedUser", user);
        chain.doFilter(request, response);
    }

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "false");
        response.setHeader("Access-Control-Expose-Headers", "*");
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
        response.getWriter().write(message);
    }
}