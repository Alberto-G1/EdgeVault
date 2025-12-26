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
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already in use.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
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
        
        // Save work information
        user.setEmployeeId(request.getEmployeeId());
        user.setJobTitle(request.getJobTitle());
        user.setSupervisorName(request.getSupervisorName());
        
        // Parse and set dateJoined
        if (request.getDateJoined() != null && !request.getDateJoined().isEmpty()) {
            try {
                user.setDateJoined(java.time.LocalDate.parse(request.getDateJoined()));
            } catch (Exception e) {
                // If parsing fails, set to today
                user.setDateJoined(java.time.LocalDate.now());
            }
        } else {
            // Default to today if not provided
            user.setDateJoined(java.time.LocalDate.now());
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
            userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
                throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already in use.");
            });
            user.setEmail(request.getEmail());
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
        
        // Update work information
        user.setEmployeeId(request.getEmployeeId());
        user.setJobTitle(request.getJobTitle());
        user.setSupervisorName(request.getSupervisorName());
        
        // Parse and set dateJoined if provided
        if (request.getDateJoined() != null && !request.getDateJoined().isEmpty()) {
            try {
                user.setDateJoined(java.time.LocalDate.parse(request.getDateJoined()));
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