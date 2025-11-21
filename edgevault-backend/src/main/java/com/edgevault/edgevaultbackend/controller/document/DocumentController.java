package com.edgevault.edgevaultbackend.controller.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.service.document.DocumentService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<DocumentResponseDto> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            DocumentResponseDto response = documentService.uploadNewDocument(file);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            // In a real app, log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<List<DocumentResponseDto>> getMyDepartmentDocuments() {
        List<DocumentResponseDto> documents = documentService.getDocumentsForCurrentUserDepartment();
        return ResponseEntity.ok(documents);
    }
}