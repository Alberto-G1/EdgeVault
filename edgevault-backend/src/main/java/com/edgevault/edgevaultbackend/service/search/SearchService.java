package com.edgevault.edgevaultbackend.service.search;

import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import com.edgevault.edgevaultbackend.model.search.DocumentSearch;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.search.DocumentSearchRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final DocumentSearchRepository documentSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final UserRepository userRepository;

    public void indexDocument(DocumentVersion version, MultipartFile file) {
        String content = "";
        try (InputStream stream = file.getInputStream()) {

            // --- THIS IS THE NEW LOGIC using PDFBox ---
            if ("application/pdf".equalsIgnoreCase(file.getContentType())) {
                try (PDDocument document = PDDocument.load(stream)) {
                    PDFTextStripper pdfStripper = new PDFTextStripper();
                    content = pdfStripper.getText(document);
                }
            } else {
                // For non-PDF files, we can try a simple text read or log a warning.
                // For now, we'll index without content if it's not a PDF.
                log.warn("Skipping content extraction for non-PDF file type: {}", file.getContentType());
                content = ""; // Or you could try to read it as plain text
            }
            // -------------------------------------------

        } catch (IOException e) {
            log.error("Failed to read file stream for document version: {}", version.getId(), e);
            // If we can't even read the file, we should stop.
            return;
        }

        try {
            DocumentSearch docSearch = DocumentSearch.builder()
                    .id(version.getId().toString())
                    .documentId(version.getDocument().getId())
                    .departmentId(version.getDocument().getDepartment().getId())
                    .title(version.getDocument().getTitle())
                    .description(version.getDocument().getDescription())
                    .originalFileName(version.getDocument().getOriginalFileName())
                    .content(content) // Use the extracted content
                    .uploaderUsername(version.getUploader().getUsername())
                    .uploadTimestamp(version.getUploadTimestamp())
                    .versionNumber(version.getVersionNumber())
                    .build();

            documentSearchRepository.save(docSearch);
            log.info("Successfully indexed document version: {}", version.getId());

        } catch (Exception e) {
            log.error("Failed to index document version after content extraction: {}", version.getId(), e);
        }
    }

    public void removeDocumentFromIndex(DocumentVersion version) {
        documentSearchRepository.deleteById(version.getId().toString());
        log.info("Removed document version from index: {}", version.getId());
    }

    public List<DocumentSearch> searchDocuments(String query) {
        User currentUser = getCurrentUser();
        Long departmentId = currentUser.getDepartment().getId();

        // Create a criteria for the search query.
        // This will search in title, description, fileName, and the extracted content.
        Criteria searchCriteria = new Criteria("title").contains(query)
                .or("description").contains(query)
                .or("fileName").contains(query)
                .or("content").contains(query);

        // Create a filter criteria to only allow results from the user's department.
        Criteria departmentFilter = new Criteria("departmentId").is(departmentId);

        // Combine the criteria: must match the department AND the search query.
        Criteria finalCriteria = departmentFilter.and(searchCriteria);

        // Build and execute the query
        CriteriaQuery criteriaQuery = new CriteriaQuery(finalCriteria);
        SearchHits<DocumentSearch> searchHits = elasticsearchOperations.search(criteriaQuery, DocumentSearch.class);

        return searchHits.stream()
                .map(hit -> hit.getContent())
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        // Use the new method that eagerly fetches the required relationships
        return userRepository.findByUsernameWithDetails(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}