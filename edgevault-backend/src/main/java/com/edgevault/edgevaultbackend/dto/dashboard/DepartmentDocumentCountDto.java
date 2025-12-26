package com.edgevault.edgevaultbackend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentDocumentCountDto {
    private String departmentName;
    private long documentCount;
}
