package com.edgevault.edgevaultbackend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentGrowthDto {
    private String period;
    private long totalDocuments;
}
