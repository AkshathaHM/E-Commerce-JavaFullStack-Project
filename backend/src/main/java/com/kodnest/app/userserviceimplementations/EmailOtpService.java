package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.EmailOtp;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.EmailOtpRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailOtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 3;

    private final EmailOtpRepository otpRepository;

    public EmailOtpService(EmailOtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public String generateOtpForEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("User email is required for OTP generation");
        }

        String otp = createNumericOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        EmailOtp emailOtp = otpRepository.findByEmail(user.getEmail())
                .map(existing -> {
                    existing.setOtp(otp);
                    existing.setExpiresAt(expiresAt);
                    return existing;
                })
                .orElseGet(() -> new EmailOtp(user.getEmail(), otp, expiresAt));

        otpRepository.save(emailOtp);
        return otp;
    }

    public User verifyOtp(String email, String otp, User user) {
        if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        EmailOtp emailOtp = otpRepository.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(emailOtp);
            throw new IllegalArgumentException("OTP has expired");
        }

        if (!emailOtp.getOtp().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        otpRepository.delete(emailOtp);
        return user;
    }

    public void deleteOtpByEmail(String email) {
        if (email != null && !email.isBlank()) {
            otpRepository.deleteByEmail(email.trim());
        }
    }

    private String createNumericOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
}
