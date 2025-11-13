package com.edgevault.edgevaultbackend.repository.user;

import com.edgevault.edgevaultbackend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Method to find a user by their username
    Optional<User> findByUsername(String username);
}