package com.edgevault.edgevaultbackend.dto.profile;

import com.edgevault.edgevaultbackend.model.user.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateProfileRequestDto {
    @Size(min = 2, message = "First name must be at least 2 characters")
    private String firstName;

    @Size(min = 2, message = "Last name must be at least 2 characters")
    private String lastName;

    private Gender gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String phoneNumber;
    private String alternativePhoneNumber;

    @Email(message = "A valid email is required")
    private String email;

    private String city;
    private String district;
    private String country;

    @Size(min = 3, message = "Username must be at least 3 characters")
    private String username;

    @Email(message = "A valid backup email is required")
    private String backupRecoveryEmail;

    private String profilePictureUrl;
}