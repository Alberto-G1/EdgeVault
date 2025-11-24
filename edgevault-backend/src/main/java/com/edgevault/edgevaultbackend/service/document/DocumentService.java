package com.edgevault.edgevaultbackend.service.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.dto.document.DocumentVersionDto;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.document.DocumentStatus;
import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.document.DocumentVersionRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.storage.FileStorageService;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public DocumentResponseDto uploadNewDocument(MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();

        // Verify that the user belongs to a department before proceeding.
        Department userDepartment = currentUser.getDepartment();
        if (Objects.isNull(userDepartment)) {
            throw new IllegalStateException("Cannot upload document: User '" + currentUser.getUsername() + "' is not assigned to a department.");
        }


        String s3ObjectKey = buildS3Key(userDepartment.getId(), file.getOriginalFilename());

        fileStorageService.uploadFile(s3ObjectKey, file);

        Document document = new Document();
        document.setOriginalFileName(file.getOriginalFilename());
        document.setDepartment(userDepartment);

        DocumentVersion version = new DocumentVersion();
        version.setDocument(document);
        version.setVersionNumber(1);
        version.setS3ObjectKey(s3ObjectKey);
        version.setFileType(file.getContentType());
        version.setSizeInBytes(file.getSize());
        version.setUploadTimestamp(LocalDateTime.now());
        version.setUploader(currentUser);

        document.getVersions().add(version);
        document.setLatestVersion(version);

        Document savedDocument = documentRepository.save(document);
        return mapToDocumentResponseDto(savedDocument);
    }

    public List<DocumentResponseDto> getDocumentsForCurrentUserDepartment() {
        User currentUser = getCurrentUser();
        Department userDepartment = currentUser.getDepartment();

        if (Objects.isNull(userDepartment)) {
            return Collections.emptyList();
        }

        // --- FILTER BY ACTIVE STATUS ---
        return documentRepository.findByDepartmentId(userDepartment.getId()).stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.ACTIVE)
                .map(this::mapToDocumentResponseDto)
                .collect(Collectors.toList());
    }

    // --- NEW METHOD: Get a single document's details ---
    public DocumentResponseDto getDocumentById(Long documentId) {
        User currentUser = getCurrentUser();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        // Security Check: Ensure the user belongs to the document's department
        if (!document.getDepartment().getId().equals(currentUser.getDepartment().getId())) {
            // In a real app with cross-department sharing, this logic would be more complex
            // For now, we'll throw a generic auth error (Spring Security will handle it)
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view this document.");
        }

        return mapToDocumentResponseDto(document);
    }

    public DownloadedFile downloadDocumentVersion(Long versionId) {
        User currentUser = getCurrentUser();
        DocumentVersion version = documentVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Document version not found with id: " + versionId));

        if (!version.getDocument().getDepartment().getId().equals(currentUser.getDepartment().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to download this file.");
        }

        ResponseInputStream<GetObjectResponse> s3ObjectStream = fileStorageService.downloadFile(version.getS3ObjectKey());

        // Wrap the InputStream from S3 into an InputStreamResource, which implements the correct Resource interface.
        InputStreamResource resource = new InputStreamResource(s3ObjectStream);


        return new DownloadedFile(
                version.getDocument().getOriginalFileName(),
                resource, // Pass the wrapped resource
                s3ObjectStream.response().contentType()
        );
    }


    @Transactional
    public void requestDocumentDeletion(Long documentId) {
        User currentUser = getCurrentUser();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        // Security Check
        if (!document.getDepartment().getId().equals(currentUser.getDepartment().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this document.");
        }

        document.setStatus(DocumentStatus.PENDING_DELETION);
        document.setDeletionRequester(currentUser);
        document.setDeletionRequestedAt(LocalDateTime.now());

        documentRepository.save(document);
    }

    // The record now correctly expects a Spring Framework Resource, not a Jakarta one.
    public record DownloadedFile(String filename, Resource resource, String contentType) {}

    private String buildS3Key(Long departmentId, String originalFileName) {
        return String.format("%d/%s_%s",
                departmentId,
                UUID.randomUUID().toString(),
                originalFileName);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));
    }

    private DocumentResponseDto mapToDocumentResponseDto(Document doc) {
        return DocumentResponseDto.builder()
                .id(doc.getId())
                .fileName(doc.getOriginalFileName())
                .latestVersion(mapToDocumentVersionDto(doc.getLatestVersion()))
                .versionHistory(doc.getVersions().stream()
                        .map(this::mapToDocumentVersionDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private DocumentVersionDto mapToDocumentVersionDto(DocumentVersion ver) {
        return DocumentVersionDto.builder()
                .id(ver.getId())
                .versionNumber(ver.getVersionNumber())
                .uploadTimestamp(ver.getUploadTimestamp())
                .sizeInBytes(ver.getSizeInBytes())
                .uploaderUsername(ver.getUploader().getUsername())
                .build();
    }
}