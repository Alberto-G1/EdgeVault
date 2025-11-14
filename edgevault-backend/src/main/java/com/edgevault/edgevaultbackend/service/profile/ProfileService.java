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
            userRepository.findByUsername(request.getUsername()).ifPresent(u -> {
                throw new DuplicateResourceException("Username is already taken.");
            });
            currentUser.setUsername(request.getUsername());
        }

        // Check for email duplication only if the email has been changed and is not empty
        if (StringUtils.hasText(request.getEmail()) && !Objects.equals(currentUser.getEmail(), request.getEmail())) {
            userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
                throw new DuplicateResourceException("Email is already in use.");
            });
            currentUser.setEmail(request.getEmail());
        }
        // ---------------------------------

        // Update fields
        currentUser.setFirstName(request.getFirstName());
        currentUser.setLastName(request.getLastName());
        currentUser.setGender(request.getGender());
        currentUser.setDateOfBirth(request.getDateOfBirth());
        currentUser.setPhoneNumber(request.getPhoneNumber());
        currentUser.setAlternativePhoneNumber(request.getAlternativePhoneNumber());
        currentUser.setCity(request.getCity());
        currentUser.setDistrict(request.getDistrict());
        currentUser.setCountry(request.getCountry());
        currentUser.setBackupRecoveryEmail(request.getBackupRecoveryEmail());
        currentUser.setProfilePictureUrl(request.getProfilePictureUrl());

        User updatedUser = userRepository.save(currentUser);
        return mapToUserProfileDto(updatedUser);
    }

    @Transactional
    public UserProfileDto updateCurrentUserWorkProfile(UpdateWorkProfileRequestDto request) {
        User currentUser = getCurrentUser();

        currentUser.setEmployeeId(request.getEmployeeId());
        currentUser.setJobTitle(request.getJobTitle());
        currentUser.setDateJoined(request.getDateJoined());
        currentUser.setSupervisorName(request.getSupervisorName());

        User updatedUser = userRepository.save(currentUser);
        return mapToUserProfileDto(updatedUser);
    }

    @Transactional
    public void changeCurrentUserPassword(ChangePasswordRequestDto request) {
        User currentUser = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadCredentialsException("Incorrect current password.");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        currentUser.setPasswordLastUpdated(LocalDateTime.now());
        currentUser.setPasswordChangeRequired(false);

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