package com.edgevault.edgevaultbackend.repository.security;

import com.edgevault.edgevaultbackend.model.security.PasswordResetToken;
import com.edgevault.edgevaultbackend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);

    @Modifying
    @Transactional
    void deleteByExpiryDateBefore(LocalDateTime dateTime);

    @Modifying
    @Transactional
    void deleteByUsedTrueAndCreatedAtBefore(LocalDateTime dateTime);
}
