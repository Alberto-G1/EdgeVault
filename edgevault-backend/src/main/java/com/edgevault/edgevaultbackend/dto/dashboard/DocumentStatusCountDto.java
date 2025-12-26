package com.edgevault.edgevaultbackend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentStatusCountDto {
    private String status;
    private long count;
}
