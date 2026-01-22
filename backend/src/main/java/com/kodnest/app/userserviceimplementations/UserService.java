package com.kodnest.app.userserviceimplementations;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.UserServiceContract;
import com.kodnest.app.usersrepositaries.UserRepository;

@Service
public class UserService implements UserServiceContract {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public User registerUser(User user) {

        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Refresh updatedAt to current time before save
        user.setUpdatedAt(java.time.LocalDateTime.now());

        // Save the user
        return userRepository.save(user);
    }
}