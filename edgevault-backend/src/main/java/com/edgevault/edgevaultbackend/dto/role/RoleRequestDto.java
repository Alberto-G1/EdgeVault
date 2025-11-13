package com.edgevault.edgevaultbackend.dto.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class RoleRequestDto {
    @NotBlank(message = "Role name cannot be blank")
    private String name;
    private Set<String> permissions;
}