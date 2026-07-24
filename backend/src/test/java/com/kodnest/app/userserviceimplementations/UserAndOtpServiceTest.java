package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.EmailOtp;
import com.kodnest.app.entities.RegisterRequest;
import com.kodnest.app.entities.User;
import com.kodnest.app.usersrepositaries.EmailOtpRepository;
import com.kodnest.app.usersrepositaries.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserAndOtpServiceTest {

    @Test
    void registerUserRejectsInvalidMobileNumber() {
        UserRepository userRepository = mock(UserRepository.class);
        EmailService emailService = mock(EmailService.class);
        EmailOtpService emailOtpService = mock(EmailOtpService.class);
        UserService userService = new UserService(userRepository, emailService, emailOtpService);

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setEmail("john@example.com");
        request.setPassword("secret123");
        request.setRole("CUSTOMER");
        request.setMobileNumber("123");

        assertThrows(IllegalArgumentException.class, () -> userService.registerUser(request));
    }

    @Test
    void generateOtpSetsExpiryToThreeMinutes() {
        EmailOtpRepository otpRepository = mock(EmailOtpRepository.class);
        EmailOtpService service = new EmailOtpService(otpRepository);
        User user = new User();
        user.setEmail("john@example.com");
        user.setUsername("john");

        when(otpRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        service.generateOtpForEmail(user);

        ArgumentCaptor<EmailOtp> captor = ArgumentCaptor.forClass(EmailOtp.class);
        verify(otpRepository).save(captor.capture());

        LocalDateTime expiresAt = captor.getValue().getExpiresAt();
        LocalDateTime now = LocalDateTime.now();
        assertTrue(expiresAt.isAfter(now.plusMinutes(2).minusSeconds(5)));
        assertTrue(expiresAt.isBefore(now.plusMinutes(4)));
    }
}
