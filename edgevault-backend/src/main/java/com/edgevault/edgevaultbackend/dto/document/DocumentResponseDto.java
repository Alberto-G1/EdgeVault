package com.edgevault.edgevaultbackend.dto.document;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DocumentResponseDto {
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private DocumentVersionDto latestVersion;
    private List<DocumentVersionDto> versionHistory;
}