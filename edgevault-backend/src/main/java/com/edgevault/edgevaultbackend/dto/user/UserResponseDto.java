package com.edgevault.edgevaultbackend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private boolean enabled;
    private Set<String> roles;
    private String departmentName;
    // Work Information fields
    private String employeeId;
    private String jobTitle;
    private String dateJoined;
    private String supervisorName;
}