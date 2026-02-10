package com.edgevault.edgevaultbackend.service.security;

import com.edgevault.edgevaultbackend.exception.InvalidTokenException;
import com.edgevault.edgevaultbackend.model.security.PasswordResetToken;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.security.PasswordResetTokenRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.password-reset.token-validity-minutes:15}")
    private int tokenValidityMinutes;

    @Value("${app.password-reset.max-attempts:5}")
    private int maxAttempts;

    /**
     * Generate a password reset token for the user with the given email.
     * Returns a generic response regardless of whether the email exists to prevent account enumeration.
     */
    @Transactional
    public void generateResetToken(String email) {
        // Validate email format
        String validatedEmail = ValidationUtil.validateEmail(email);
        
        Optional<User> userOptional = userRepository.findByEmail(validatedEmail);
        
        if (userOptional.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", validatedEmail);
            // Return silently to prevent account enumeration
            return;
        }

        User user = userOptional.get();
        
        // Invalidate any existing tokens for this user
        invalidateAllUserTokens(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(tokenValidityMinutes);
        
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        tokenRepository.save(resetToken);

        log.info("Password reset token generated for user: {}", user.getUsername());

        // Send email with reset link
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }

    /**
     * Validate a password reset token.
     * Returns the associated user if valid, throws exception if invalid.
     */
    @Transactional(readOnly = true)
    public User validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (!resetToken.isValid()) {
            throw new InvalidTokenException("Invalid or expired reset token");
        }

        return resetToken.getUser();
    }

    /**
     * Reset the user's password using a valid token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (!resetToken.isValid()) {
            throw new InvalidTokenException("Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        
        // Validate new password
        String validatedPassword = ValidationUtil.validatePassword(
            newPassword,
            user.getFirstName(),
            user.getLastName(),
            user.getUsername()
        );
        
        // Encode and set new password
        user.setPassword(passwordEncoder.encode(validatedPassword));
        user.setPasswordLastUpdated(LocalDateTime.now());
        user.setPasswordChangeRequired(false);
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getUsername());

        // Send confirmation email
        emailService.sendPasswordResetConfirmationEmail(user.getEmail(), user.getUsername());
    }

    /**
     * Invalidate all password reset tokens for a user.
     */
    @Transactional
    public void invalidateAllUserTokens(User user) {
        tokenRepository.deleteByUser(user);
        log.info("Invalidated all password reset tokens for user: {}", user.getUsername());
    }

    /**
     * Scheduled task to clean up expired and used tokens.
     * Runs daily at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        
        // Delete used tokens older than 7 days
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        tokenRepository.deleteByUsedTrueAndCreatedAtBefore(sevenDaysAgo);
        
        log.info("Cleaned up expired and old used password reset tokens");
    }
}
