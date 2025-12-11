package com.edgevault.edgevaultbackend.service.security;

import com.edgevault.edgevaultbackend.exception.InvalidTokenException;
import com.edgevault.edgevaultbackend.model.security.RememberMeToken;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.security.RememberMeTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RememberMeService {

    private final RememberMeTokenRepository tokenRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.remember-me.token-validity-days:30}")
    private int tokenValidityDays;

    @Value("${app.remember-me.rotate-on-use:true}")
    private boolean rotateOnUse;

    /**
     * Generate a remember me token for the user.
     */
    @Transactional
    public String generateRememberMeToken(User user, String ipAddress, String userAgent) {
        // Generate cryptographically secure random token
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        LocalDateTime expiryDate = LocalDateTime.now().plusDays(tokenValidityDays);
        
        RememberMeToken rememberMeToken = new RememberMeToken(
                token, 
                user, 
                expiryDate, 
                ipAddress, 
                userAgent
        );
        
        tokenRepository.save(rememberMeToken);

        log.info("Remember me token generated for user: {}", user.getUsername());

        return token;
    }

    /**
     * Validate a remember me token and optionally rotate it.
     */
    @Transactional
    public User validateAndRotateToken(String token, String ipAddress, String userAgent) {
        Optional<RememberMeToken> tokenOptional = tokenRepository.findByToken(token);
        
        if (tokenOptional.isEmpty()) {
            throw new InvalidTokenException("Invalid remember me token");
        }

        RememberMeToken rememberMeToken = tokenOptional.get();

        if (!rememberMeToken.isValid()) {
            // Invalidate expired or inactive token
            rememberMeToken.setActive(false);
            tokenRepository.save(rememberMeToken);
            throw new InvalidTokenException("Remember me token expired or inactive");
        }

        User user = rememberMeToken.getUser();

        // Update last used timestamp
        rememberMeToken.updateLastUsed();

        if (rotateOnUse) {
            // Rotate token: invalidate old token and generate new one
            rememberMeToken.setActive(false);
            tokenRepository.save(rememberMeToken);
            
            String newToken = generateRememberMeToken(user, ipAddress, userAgent);
            log.info("Remember me token rotated for user: {}", user.getUsername());
            
            // Store new token in thread-local or return it separately
            user.setLastLogin(LocalDateTime.now());
            
            return user;
        } else {
            tokenRepository.save(rememberMeToken);
            user.setLastLogin(LocalDateTime.now());
            return user;
        }
    }

    /**
     * Validate a remember me token without rotation (for checking only).
     */
    @Transactional(readOnly = true)
    public User validateToken(String token) {
        RememberMeToken rememberMeToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid remember me token"));

        if (!rememberMeToken.isValid()) {
            throw new InvalidTokenException("Remember me token expired or inactive");
        }

        return rememberMeToken.getUser();
    }

    /**
     * Get the current valid token string after rotation (to be called after validateAndRotateToken).
     * Returns the most recent active token for the user.
     */
    @Transactional(readOnly = true)
    public Optional<String> getCurrentToken(User user) {
        return tokenRepository.findByUserAndActiveTrue(user).stream()
                .filter(RememberMeToken::isValid)
                .max((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                .map(RememberMeToken::getToken);
    }

    /**
     * Invalidate a specific remember me token.
     */
    @Transactional
    public void invalidateToken(String token) {
        Optional<RememberMeToken> tokenOptional = tokenRepository.findByToken(token);
        
        if (tokenOptional.isPresent()) {
            RememberMeToken rememberMeToken = tokenOptional.get();
            rememberMeToken.setActive(false);
            tokenRepository.save(rememberMeToken);
            log.info("Remember me token invalidated for user: {}", rememberMeToken.getUser().getUsername());
        }
    }

    /**
     * Invalidate all remember me tokens for a user (logout from all devices).
     */
    @Transactional
    public void invalidateAllUserTokens(User user) {
        tokenRepository.deleteByUser(user);
        log.info("Invalidated all remember me tokens for user: {}", user.getUsername());
    }

    /**
     * Scheduled task to clean up expired and inactive tokens.
     * Runs daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        
        // Delete inactive tokens not used in 60 days
        LocalDateTime sixtyDaysAgo = now.minusDays(60);
        tokenRepository.deleteByActiveFalseAndLastUsedBefore(sixtyDaysAgo);
        
        log.info("Cleaned up expired and old inactive remember me tokens");
    }
}
