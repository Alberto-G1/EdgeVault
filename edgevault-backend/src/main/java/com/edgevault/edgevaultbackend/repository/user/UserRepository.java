package com.edgevault.edgevaultbackend.repository.user;

import com.edgevault.edgevaultbackend.dto.user.UserSummaryDto;
import com.edgevault.edgevaultbackend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // This query now eagerly fetches the User, their Department, their Roles,
    // AND the Permissions associated with each Role. This is a complete data graph.
    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.department " +
            "LEFT JOIN FETCH u.roles r " +
            "LEFT JOIN FETCH r.permissions " +
            "WHERE u.username = :username")
    Optional<User> findByUsernameWithDetails(String username);

    // Keep the simple findByUsername for cases where you don't need the full graph
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT new com.edgevault.edgevaultbackend.dto.user.UserSummaryDto(u.id, u.username, u.profilePictureUrl) FROM User u")
    List<UserSummaryDto> findAllUserSummaries();
}