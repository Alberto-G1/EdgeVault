package com.edgevault.edgevaultbackend.service.user;

import com.edgevault.edgevaultbackend.dto.user.CreateUserRequestDto;
import com.edgevault.edgevaultbackend.dto.user.UpdateUserRequestDto;
import com.edgevault.edgevaultbackend.dto.user.UserResponseDto;
import com.edgevault.edgevaultbackend.dto.user.UserSummaryDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.department.DepartmentRepository;
import com.edgevault.edgevaultbackend.repository.role.RoleRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService; // <-- INJECT

    public List<UserResponseDto> getAllUserDetails() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponseDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getAllUserSummaries() {
        return userRepository.findAllUserSummaries();
    }

    @Transactional
    public UserResponseDto createUser(CreateUserRequestDto request) {
        // Validate and sanitize inputs
        String username = ValidationUtil.validateUsername(request.getUsername());
        String email = ValidationUtil.validateEmail(request.getEmail());
        
        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("Email '" + email + "' is already in use.");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Default@123U"));
        user.setPasswordChangeRequired(true);

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        user.setDepartment(department);

        Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);
        
        // Save work information with validation
        user.setEmployeeId(ValidationUtil.validateEmployeeId(request.getEmployeeId()));
        user.setJobTitle(ValidationUtil.validateJobTitle(request.getJobTitle()));
        user.setSupervisorName(ValidationUtil.validateSupervisorName(request.getSupervisorName()));
        
        // Parse and set dateJoined
        if (request.getDateJoined() != null && !request.getDateJoined().isEmpty()) {
            try {
                user.setDateJoined(ValidationUtil.validateDateJoined(java.time.LocalDate.parse(request.getDateJoined())));
            } catch (Exception e) {
                // If parsing fails, set to today
                user.setDateJoined(ValidationUtil.validateDateJoined(null));
            }
        } else {
            // Default to today if not provided
            user.setDateJoined(ValidationUtil.validateDateJoined(null));
        }

        User savedUser = userRepository.save(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Created new user '%s' with roles [%s] in department '%s'.",
                savedUser.getUsername(),
                request.getRoles().stream().collect(Collectors.joining(", ")),
                department.getName());
        auditService.recordEvent(getCurrentUsername(), "USER_CREATE", auditDetails);
        // -----------------

        return mapToUserResponseDto(savedUser);
    }

    @Transactional
    public UserResponseDto updateUser(Long userId, UpdateUserRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            String validatedEmail = ValidationUtil.validateEmail(request.getEmail());
            userRepository.findByEmail(validatedEmail).ifPresent(u -> {
                throw new DuplicateResourceException("Email '" + validatedEmail + "' is already in use.");
            });
            user.setEmail(validatedEmail);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        user.setDepartment(department);

        Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);
        
        // Update account status based on enabled field
        if (request.isEnabled()) {
            user.setAccountStatus(com.edgevault.edgevaultbackend.model.user.AccountStatus.ACTIVE);
        } else {
            user.setAccountStatus(com.edgevault.edgevaultbackend.model.user.AccountStatus.SUSPENDED);
        }
        
        // Update work information with validation
        user.setEmployeeId(ValidationUtil.validateEmployeeId(request.getEmployeeId()));
        user.setJobTitle(ValidationUtil.validateJobTitle(request.getJobTitle()));
        user.setSupervisorName(ValidationUtil.validateSupervisorName(request.getSupervisorName()));
        
        // Parse and set dateJoined if provided
        if (request.getDateJoined() != null && !request.getDateJoined().isEmpty()) {
            try {
                user.setDateJoined(ValidationUtil.validateDateJoined(java.time.LocalDate.parse(request.getDateJoined())));
            } catch (Exception e) {
                // Keep existing dateJoined if parsing fails
            }
        }

        User updatedUser = userRepository.save(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Updated user '%s' (ID: %d). Set enabled=%b, roles=[%s], department='%s'.",
                updatedUser.getUsername(),
                userId,
                request.isEnabled(),
                request.getRoles().stream().collect(Collectors.joining(", ")),
                department.getName());
        auditService.recordEvent(getCurrentUsername(), "USER_UPDATE", auditDetails);
        // -----------------

        return mapToUserResponseDto(updatedUser);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        boolean isSuperAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("Super Admin"));
        if (isSuperAdmin) {
            long superAdminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("Super Admin")))
                    .count();
            if (superAdminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last super administrator.");
            }
        }
        userRepository.delete(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Deleted user '%s' (ID: %d).", user.getUsername(), userId);
        auditService.recordEvent(getCurrentUsername(), "USER_DELETE", auditDetails);
        // -----------------
    }

    @Transactional
    public void resetUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Validate new password
        String validatedPassword = ValidationUtil.validatePassword(
            newPassword,
            user.getFirstName(),
            user.getLastName(),
            user.getUsername()
        );

        user.setPassword(passwordEncoder.encode(validatedPassword));
        user.setPasswordLastUpdated(java.time.LocalDateTime.now());
        user.setPasswordChangeRequired(true); // Force user to change password on next login
        userRepository.save(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Admin reset password for user '%s' (ID: %d).", user.getUsername(), userId);
        auditService.recordEvent(getCurrentUsername(), "USER_PASSWORD_RESET_BY_ADMIN", auditDetails);
        // -----------------
    }

    @Transactional
    public UserResponseDto activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setAccountStatus(com.edgevault.edgevaultbackend.model.user.AccountStatus.ACTIVE);
        User updatedUser = userRepository.save(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Activated user '%s' (ID: %d).", user.getUsername(), userId);
        auditService.recordEvent(getCurrentUsername(), "USER_ACTIVATE", auditDetails);
        // -----------------

        return mapToUserResponseDto(updatedUser);
    }

    @Transactional
    public UserResponseDto deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Prevent deactivating the last super admin
        boolean isSuperAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("Super Admin"));
        if (isSuperAdmin) {
            long activeSuperAdminCount = userRepository.findAll().stream()
                    .filter(u -> u.getAccountStatus() == com.edgevault.edgevaultbackend.model.user.AccountStatus.ACTIVE)
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("Super Admin")))
                    .count();
            if (activeSuperAdminCount <= 1) {
                throw new IllegalStateException("Cannot deactivate the last active super administrator.");
            }
        }

        user.setAccountStatus(com.edgevault.edgevaultbackend.model.user.AccountStatus.SUSPENDED);
        User updatedUser = userRepository.save(user);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Deactivated user '%s' (ID: %d).", user.getUsername(), userId);
        auditService.recordEvent(getCurrentUsername(), "USER_DEACTIVATE", auditDetails);
        // -----------------

        return mapToUserResponseDto(updatedUser);
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : "N/A")
                .employeeId(user.getEmployeeId())
                .jobTitle(user.getJobTitle())
                .dateJoined(user.getDateJoined() != null ? user.getDateJoined().toString() : null)
                .supervisorName(user.getSupervisorName())
                .build();
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}