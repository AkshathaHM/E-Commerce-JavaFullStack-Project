package com.kodnest.app.adminServiceImplementations;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminUserServiceContract;
import com.kodnest.app.entities.Role;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.JWTokenRepository;
import com.kodnest.app.usersrepositaries.UserRepository;

@Service
public class AdminUserService implements AdminUserServiceContract{
	
	private UserRepository userRepository;
	private JWTokenRepository jwtTokenRepository;

	public AdminUserService(UserRepository userRepository, JWTokenRepository jwtTokenRepository) {
		super();
		this.userRepository = userRepository;
		this.jwtTokenRepository = jwtTokenRepository;
	}

	@Override
	public User modifyUser(Integer userId, String username, String email, String role) {
		Optional<User> userOptional = userRepository.findById(userId);

		if (userOptional.isEmpty()) {
		    throw new IllegalArgumentException("User not found");
		}

		User existingUser = userOptional.get();

		if (username != null && !username.isEmpty()) {
		    existingUser.setUsername(username);
		}

		if (email != null && !email.isEmpty()) {
		    existingUser.setEmail(email);
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
	public User getUserById(Integer userId) {
		return userRepository.findById(userId)
		        .orElseThrow(() -> new IllegalArgumentException("User not found"));

	}

}
