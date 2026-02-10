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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Endpoint for lightweight user list (for chat)
    @GetMapping("/summaries")
    public ResponseEntity<List<UserSummaryDto>> getAllUserSummaries() {
        return ResponseEntity.ok(userService.getAllUserSummaries());
    }

    // Endpoint for detailed user list (for User Management page)
    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<List<UserResponseDto>> getAllUserDetails() {
        return ResponseEntity.ok(userService.getAllUserDetails());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDto request) {
        UserResponseDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        userService.resetUserPassword(id, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserResponseDto> activateUser(@PathVariable Long id) {
        UserResponseDto user = userService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserResponseDto> deactivateUser(@PathVariable Long id) {
        UserResponseDto user = userService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }
}