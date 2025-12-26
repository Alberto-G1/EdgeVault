package com.edgevault.edgevaultbackend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequestDto {

    @Email(message = "Email should be valid")
    private String email;

    private boolean enabled;

    @NotEmpty(message = "User must have at least one role")
    private Set<String> roles;

    @jakarta.validation.constraints.NotNull(message = "Department ID is required")
    private Long departmentId;
    
    // Work Information fields
    private String employeeId;
    private String jobTitle;
    private String supervisorName;
    private String dateJoined; // String format "yyyy-MM-dd"
}