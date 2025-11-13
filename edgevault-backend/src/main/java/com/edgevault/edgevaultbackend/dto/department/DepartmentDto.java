
package com.edgevault.edgevaultbackend.dto.department;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
}