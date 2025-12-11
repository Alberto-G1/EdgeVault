package com.edgevault.edgevaultbackend.dto.document;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DocumentVersionDto {
    private Long id;
    private Integer versionNumber;
    private String uploaderUsername;
    private LocalDateTime uploadTimestamp;
    private Long sizeInBytes;
    private String description;
}