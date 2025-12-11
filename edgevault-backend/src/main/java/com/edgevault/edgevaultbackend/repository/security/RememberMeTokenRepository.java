package com.edgevault.edgevaultbackend.repository.security;

import com.edgevault.edgevaultbackend.model.security.RememberMeToken;
import com.edgevault.edgevaultbackend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RememberMeTokenRepository extends JpaRepository<RememberMeToken, Long> {

    Optional<RememberMeToken> findByToken(String token);

    List<RememberMeToken> findByUser(User user);

    List<RememberMeToken> findByUserAndActiveTrue(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);

    @Modifying
    @Transactional
    void deleteByTokenAndUser(String token, User user);

    @Modifying
    @Transactional
    void deleteByExpiryDateBefore(LocalDateTime dateTime);

    @Modifying
    @Transactional
    void deleteByActiveFalseAndLastUsedBefore(LocalDateTime dateTime);
}
