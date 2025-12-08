package com.edgevault.edgevaultbackend.repository.user;

import com.edgevault.edgevaultbackend.dto.user.UserSummaryDto; // <-- IMPORT
import com.edgevault.edgevaultbackend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- IMPORT
import org.springframework.stereotype.Repository;

import java.util.List; // <-- IMPORT
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT new com.edgevault.edgevaultbackend.dto.user.UserSummaryDto(u.id, u.username, u.profilePictureUrl) FROM User u")
    List<UserSummaryDto> findAllUserSummaries();
}