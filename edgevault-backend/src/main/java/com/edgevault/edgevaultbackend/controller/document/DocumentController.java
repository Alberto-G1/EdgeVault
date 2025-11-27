package com.edgevault.edgevaultbackend.controller.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentApprovalDto;
import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.service.document.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasAuthority('DOCUMENT_CREATE')")
    public ResponseEntity<DocumentResponseDto> uploadDocument(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {
        try {
            DocumentResponseDto response = documentService.uploadNewDocument(title, description, file);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<List<DocumentResponseDto>> getMyDepartmentDocuments() {
        List<DocumentResponseDto> documents = documentService.getDocumentsForCurrentUserDepartment();
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<DocumentResponseDto> getDocumentDetails(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping("/versions/{versionId}/download")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<InputStreamResource> downloadVersion(@PathVariable Long versionId) {
        DocumentService.DownloadedFile downloadedFile = documentService.downloadDocumentVersion(versionId);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedFile.filename() + "\"");
        headers.add(HttpHeaders.CONTENT_TYPE, downloadedFile.contentType());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource((InputStreamSource) downloadedFile.resource()));
    }

    @DeleteMapping("/{id}/request-deletion")
    @PreAuthorize("hasAuthority('DOCUMENT_DELETE')")
    public ResponseEntity<Void> requestDeletion(@PathVariable Long id) {
        documentService.requestDocumentDeletion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{documentId}/versions")
    @PreAuthorize("hasAuthority('DOCUMENT_UPDATE')")
    public ResponseEntity<DocumentResponseDto> uploadNewVersion(
            @PathVariable Long documentId,
            @RequestParam("file") MultipartFile file) {
        try {
            DocumentResponseDto response = documentService.uploadNewVersion(documentId, file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- ENDPOINTS for APPROVAL WORKFLOW ---

    @GetMapping("/pending-deletion")
    @PreAuthorize("hasAuthority('DOCUMENT_APPROVAL')")
    public ResponseEntity<List<DocumentApprovalDto>> getPendingDeletionDocuments() {
        return ResponseEntity.ok(documentService.getPendingDeletionDocuments());
    }

    @PostMapping("/{id}/approve-deletion")
    @PreAuthorize("hasAuthority('DOCUMENT_APPROVAL')")
    public ResponseEntity<Void> approveDeletion(@PathVariable Long id) {
        documentService.approveDeletion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reject-deletion")
    @PreAuthorize("hasAuthority('DOCUMENT_APPROVAL')")
    public ResponseEntity<Void> rejectDeletion(@PathVariable Long id) {
        documentService.rejectDeletion(id);
        return ResponseEntity.noContent().build();
    }
}