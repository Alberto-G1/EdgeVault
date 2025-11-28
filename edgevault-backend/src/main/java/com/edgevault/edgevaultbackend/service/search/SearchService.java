package com.edgevault.edgevaultbackend.service.search;

import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import com.edgevault.edgevaultbackend.model.search.DocumentSearch;
import com.edgevault.edgevaultbackend.repository.search.DocumentSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument; // <-- IMPORT PDFBox
import org.apache.pdfbox.text.PDFTextStripper; // <-- IMPORT PDFBox
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final DocumentSearchRepository documentSearchRepository;
    // Tika instance is no longer needed

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
}