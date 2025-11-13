package com.edgevault.edgevaultbackend.dto.role;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class RoleDto {
    private Long id;
    private String name;
    private Set<String> permissions;
}