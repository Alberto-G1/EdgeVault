package com.edgevault.edgevaultbackend.dto.document;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DocumentApprovalDto {
    private Long documentId;
    private String title;
    private String requesterUsername;
    private String departmentName;
    private LocalDateTime requestedAt;
}