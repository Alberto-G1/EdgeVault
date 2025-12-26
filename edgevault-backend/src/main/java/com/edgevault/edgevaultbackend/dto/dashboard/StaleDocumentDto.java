package com.edgevault.edgevaultbackend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaleDocumentDto {
    private Long id;
    private String title;
    private String departmentName;
    private LocalDateTime lastModified;
    private long daysSinceModified;
}
