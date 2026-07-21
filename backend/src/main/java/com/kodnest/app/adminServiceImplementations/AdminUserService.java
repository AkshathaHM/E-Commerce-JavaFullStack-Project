package com.kodnest.app.adminServiceImplementations;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminUserServiceContract;
import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.userserviceimplementations.EmailService;
import com.kodnest.app.userserviceimplementations.EmailOtpService;
import com.kodnest.app.usersrepositaries.JWTokenRepository;
import com.kodnest.app.usersrepositaries.UserRepository;

@Service
public class AdminUserService implements AdminUserServiceContract{
    
    private final UserRepository userRepository;
    private final JWTokenRepository jwtTokenRepository;
    private final EmailOtpService emailOtpService;
    private final EmailService emailService;

    public AdminUserService(UserRepository userRepository, JWTokenRepository jwtTokenRepository,
            EmailOtpService emailOtpService, EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.emailOtpService = emailOtpService;
        this.emailService = emailService;
    }

    @Override
    public User modifyUser(Integer userId, String username, String email, String role, String otp) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User existingUser = userOptional.get();
        boolean emailChanged = email != null && !email.isBlank() && !email.equals(existingUser.getEmail());

        if (emailChanged) {
            if (otp == null || otp.isBlank()) {
                throw new IllegalArgumentException("OTP is required to change email");
            }
            if (userRepository.findByEmail(email.trim()).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            emailOtpService.verifyOtp(email.trim(), otp.trim(), existingUser);
            existingUser.setEmail(email.trim());
            existingUser.setVerified(true);
            existingUser.setEnabled(true);
        }

        if (username != null && !username.isEmpty()) {
            existingUser.setUsername(username);
        }

        if (role != null && !role.isEmpty()) {
            try {
                existingUser.setRole(Role.valueOf(role));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + role);
            }
        }
        
        jwtTokenRepository.deleteById(userId);

        return userRepository.save(existingUser);
    }

    @Override
    public void requestEmailChangeOtp(Integer userId, String newEmail) {
        User existingUser = getUserById(userId);
        if (newEmail == null || newEmail.isBlank()) {
            throw new IllegalArgumentException("New email is required");
        }
        if (newEmail.equals(existingUser.getEmail())) {
            throw new IllegalArgumentException("New email must be different from current email");
        }
        if (userRepository.findByEmail(newEmail.trim()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User tempUser = new User();
        tempUser.setEmail(newEmail.trim());
        tempUser.setUsername(existingUser.getUsername());
        tempUser.setName(existingUser.getName());

        String otp = emailOtpService.generateOtpForEmail(tempUser);
        emailService.sendOtpEmail(tempUser, otp);
    }

    @Override
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
