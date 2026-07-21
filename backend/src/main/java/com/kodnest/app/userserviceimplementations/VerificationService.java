package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.User;
import com.kodnest.app.entities.VerificationToken;
import com.kodnest.app.usersrepositaries.UserRepository;
import com.kodnest.app.usersrepositaries.VerificationTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class VerificationService {

    private static final long EXPIRATION_HOURS = 24;

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    public VerificationService(VerificationTokenRepository tokenRepository,
                               UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    public String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
                token,
                LocalDateTime.now().plusHours(EXPIRATION_HOURS),
                user
        );
        tokenRepository.save(verificationToken);
        return token;
    }

    public User verifyToken(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setVerified(true);
        user.setEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        return user;
    }
}
