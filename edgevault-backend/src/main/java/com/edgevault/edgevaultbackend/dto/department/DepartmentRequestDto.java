package com.edgevault.edgevaultbackend.dto.department;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentRequestDto {
    @NotBlank(message = "Department name cannot be blank")
    private String name;

    private String description;
}