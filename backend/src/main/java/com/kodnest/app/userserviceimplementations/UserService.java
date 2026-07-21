package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.RegisterRequest;
import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.UserServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService implements UserServiceContract {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailOtpService emailOtpService;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       EmailService emailService,
                       EmailOtpService emailOtpService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.emailOtpService = emailOtpService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public User registerUser(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration data is required");
        }

        String username = request.getUsername();
        String email = request.getEmail();
        String password = request.getPassword();

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        User user = new User();
        user.setUsername(username.trim());
        user.setName(username.trim());
        user.setEmail(email.trim());
        user.setPassword(passwordEncoder.encode(password));
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                user.setRole(Role.valueOf(request.getRole().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role specified");
            }
        } else {
            user.setRole(Role.CUSTOMER);
        }
        user.setVerified(false);
        user.setEnabled(false);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String otp = emailOtpService.generateOtpForEmail(savedUser);
        emailService.sendOtpEmail(savedUser, otp);

        return savedUser;
    }
}