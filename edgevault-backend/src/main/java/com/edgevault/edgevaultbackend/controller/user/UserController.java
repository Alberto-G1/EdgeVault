package com.edgevault.edgevaultbackend.controller.user;

import com.edgevault.edgevaultbackend.dto.user.CreateUserRequestDto;
import com.edgevault.edgevaultbackend.dto.user.UpdateUserRequestDto;
import com.edgevault.edgevaultbackend.dto.user.UserResponseDto;
import com.edgevault.edgevaultbackend.dto.user.UserSummaryDto;
import com.edgevault.edgevaultbackend.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // This is the main, protected endpoint for the User Management page.
    // The method call is changed from getAllUsers() to getAllUserDetails().
    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<List<UserResponseDto>> getAllUserDetails() {
        return ResponseEntity.ok(userService.getAllUserDetails());
    }

    // --- UNSECURED ENDPOINT FOR CHAT ---
    @GetMapping("/summaries")
    public ResponseEntity<List<UserSummaryDto>> getAllUserSummaries() {
        return ResponseEntity.ok(userService.getAllUserSummaries());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')") // <-- UPDATED
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')") // <-- UPDATED
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDto request) {
        UserResponseDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')") // <-- UPDATED
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}