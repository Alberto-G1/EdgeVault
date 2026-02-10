package com.edgevault.edgevaultbackend.service.search;

import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.dto.document.DocumentVersionDto;
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;


    // No-op methods - we don't need indexing anymore!
    public void indexDocument(DocumentVersion version, MultipartFile file) {
        log.info("Document indexing not needed - using database search");
    }

    public void removeDocumentFromIndex(DocumentVersion version) {
        log.info("Document removal from index not needed - using database search");
    }

    /**
     * Simple and fast database search - no Elasticsearch complexity!
     * Searches in title, description, and filename using SQL LIKE.
     */
    public List<DocumentResponseDto> searchDocuments(String query) {
        try {
            // Sanitize search query to prevent SQL injection
            String sanitizedQuery = ValidationUtil.sanitize(query);
            if (sanitizedQuery == null || sanitizedQuery.trim().isEmpty()) {
                log.warn("Empty search query provided");
                return List.of();
            }
            
            User currentUser = getCurrentUser();
            
            if (currentUser.getDepartment() == null) {
                log.warn("User {} has no department assigned, returning empty search results", currentUser.getUsername());
                return List.of();
            }
            
            Long departmentId = currentUser.getDepartment().getId();
            log.info("Searching documents for query: '{}' in department: {}", sanitizedQuery, departmentId);

            // Simple database search - much faster and simpler than Elasticsearch!
            List<Document> documents = documentRepository.searchDocuments(departmentId, sanitizedQuery);
            
            // Convert to DTOs
            List<DocumentResponseDto> results = documents.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            log.info("Found {} results for query: '{}'", results.size(), sanitizedQuery);
            return results;
            
        } catch (Exception e) {
            log.error("Error searching documents with query: '{}'", query, e);
            throw new RuntimeException("Failed to search documents: " + e.getMessage(), e);
        }
    }

    private DocumentResponseDto convertToDto(Document document) {
        DocumentVersionDto latestVersionDto = null;
        
        if (document.getLatestVersion() != null) {
            DocumentVersion version = document.getLatestVersion();
            latestVersionDto = DocumentVersionDto.builder()
                    .id(version.getId())
                    .versionNumber(version.getVersionNumber())
                    .uploaderUsername(version.getUploader() != null ? version.getUploader().getUsername() : null)
                    .uploadTimestamp(version.getUploadTimestamp())
                    .sizeInBytes(version.getSizeInBytes())
                    .description(version.getDescription())
                    .build();
        }
        
        return DocumentResponseDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .description(document.getDescription())
                .fileName(document.getOriginalFileName())
                .latestVersion(latestVersionDto)
                .versionHistory(null) // Not needed for search results
                .build();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameWithDetails(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    /**
     * No-op - not needed for database search
     */
    public void clearIndex() {
        log.info("Clear index not needed - using database search");
    }
}
