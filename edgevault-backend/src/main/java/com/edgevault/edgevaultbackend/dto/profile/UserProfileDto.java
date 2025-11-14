package com.edgevault.edgevaultbackend.dto.profile;

import com.edgevault.edgevaultbackend.model.user.AccountStatus;
import com.edgevault.edgevaultbackend.model.user.Gender;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserProfileDto {
    // Personal Info
    private String profilePictureUrl;
    private String firstName;
    private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String alternativePhoneNumber;
    private String email;
    private String city;
    private String district;
    private String country;

    // Work Info
    private String departmentName;
    private Set<String> roles;
    private String employeeId;
    private String jobTitle;
    private LocalDate dateJoined;
    private String supervisorName;

    // System Info
    private String username;
    private LocalDateTime lastLogin;
    private AccountStatus accountStatus;
    private LocalDateTime passwordLastUpdated;

    // Security
    private String backupRecoveryEmail;
}