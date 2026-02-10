package com.edgevault.edgevaultbackend.service.profile;

import com.edgevault.edgevaultbackend.dto.profile.ChangePasswordRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UpdateProfileRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UpdateWorkProfileRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UserProfileDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Objects; // <-- IMPORT THIS
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserProfileDto getCurrentUserProfile() {
        User currentUser = getCurrentUser();
        return mapToUserProfileDto(currentUser);
    }

    @Transactional
    public UserProfileDto updateCurrentUserProfile(UpdateProfileRequestDto request) {
        User currentUser = getCurrentUser();

        // --- ROBUST NULL-SAFE CHECKS ---
        // Check for username duplication only if the username has been changed and is not empty
        if (StringUtils.hasText(request.getUsername()) && !Objects.equals(currentUser.getUsername(), request.getUsername())) {
            String validatedUsername = ValidationUtil.validateUsername(request.getUsername());
            userRepository.findByUsername(validatedUsername).ifPresent(u -> {
                throw new DuplicateResourceException("Username is already taken.");
            });
            currentUser.setUsername(validatedUsername);
        }

        // Check for email duplication only if the email has been changed and is not empty
        if (StringUtils.hasText(request.getEmail()) && !Objects.equals(currentUser.getEmail(), request.getEmail())) {
            String validatedEmail = ValidationUtil.validateEmail(request.getEmail());
            userRepository.findByEmail(validatedEmail).ifPresent(u -> {
                throw new DuplicateResourceException("Email is already in use.");
            });
            currentUser.setEmail(validatedEmail);
        }
        // ---------------------------------

        // Update fields with validation
        currentUser.setFirstName(ValidationUtil.validateFirstName(request.getFirstName()));
        currentUser.setLastName(ValidationUtil.validateLastName(request.getLastName()));
        currentUser.setGender(request.getGender());
        currentUser.setDateOfBirth(ValidationUtil.validateOptionalDateOfBirth(request.getDateOfBirth()));
        currentUser.setPhoneNumber(ValidationUtil.validateOptionalPhone(request.getPhoneNumber()));
        currentUser.setAlternativePhoneNumber(ValidationUtil.validateAlternativePhoneNumber(request.getAlternativePhoneNumber()));
        currentUser.setCity(ValidationUtil.validateCity(request.getCity()));
        currentUser.setDistrict(ValidationUtil.validateDistrict(request.getDistrict()));
        currentUser.setCountry(ValidationUtil.validateCountry(request.getCountry()));
        currentUser.setBackupRecoveryEmail(ValidationUtil.validateOptionalEmail(request.getBackupRecoveryEmail()));
        currentUser.setProfilePictureUrl(ValidationUtil.validateProfilePictureUrl(request.getProfilePictureUrl()));

        User updatedUser = userRepository.save(currentUser);

        // --- AUDIT LOG ---
        auditService.recordEvent(currentUser.getUsername(), "PROFILE_UPDATE_PERSONAL", "User updated their personal profile information.");
        // -----------------

        return mapToUserProfileDto(updatedUser);
    }

    @Transactional
    public UserProfileDto updateCurrentUserWorkProfile(UpdateWorkProfileRequestDto request) {
        User currentUser = getCurrentUser();

        currentUser.setEmployeeId(ValidationUtil.validateEmployeeId(request.getEmployeeId()));
        currentUser.setJobTitle(ValidationUtil.validateJobTitle(request.getJobTitle()));
        currentUser.setDateJoined(ValidationUtil.validateDateJoined(request.getDateJoined()));
        currentUser.setSupervisorName(ValidationUtil.validateSupervisorName(request.getSupervisorName()));

        User updatedUser = userRepository.save(currentUser);

        // --- AUDIT LOG ---
        auditService.recordEvent(currentUser.getUsername(), "PROFILE_UPDATE_WORK", "User updated their work profile information.");
        // -----------------

        return mapToUserProfileDto(updatedUser);
    }

    @Transactional
    public void changeCurrentUserPassword(ChangePasswordRequestDto request) {
        User currentUser = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadCredentialsException("Incorrect current password.");
        }

        // Validate new password
        String validatedPassword = ValidationUtil.validatePassword(
            request.getNewPassword(),
            currentUser.getFirstName(),
            currentUser.getLastName(),
            currentUser.getUsername()
        );

        currentUser.setPassword(passwordEncoder.encode(validatedPassword));
        currentUser.setPasswordLastUpdated(LocalDateTime.now());
        currentUser.setPasswordChangeRequired(false);

        // --- AUDIT LOG ---
        auditService.recordEvent(currentUser.getUsername(), "PASSWORD_CHANGE_SUCCESS", "User successfully changed their password.");
        // -----------------
        
        userRepository.save(currentUser);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found in database"));
    }

    private UserProfileDto mapToUserProfileDto(User user) {
        return UserProfileDto.builder()
                .profilePictureUrl(user.getProfilePictureUrl())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .phoneNumber(user.getPhoneNumber())
                .alternativePhoneNumber(user.getAlternativePhoneNumber())
                .email(user.getEmail())
                .city(user.getCity())
                .district(user.getDistrict())
                .country(user.getCountry())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : "N/A")
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .employeeId(user.getEmployeeId())
                .jobTitle(user.getJobTitle())
                .dateJoined(user.getDateJoined())
                .supervisorName(user.getSupervisorName())
                .username(user.getUsername())
                .lastLogin(user.getLastLogin())
                .accountStatus(user.getAccountStatus())
                .passwordLastUpdated(user.getPasswordLastUpdated())
                .backupRecoveryEmail(user.getBackupRecoveryEmail())
                .build();
    }
}