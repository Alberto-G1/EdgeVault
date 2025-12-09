package com.edgevault.edgevaultbackend.service.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentApprovalDto;
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
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.service.search.SearchService;
import com.edgevault.edgevaultbackend.service.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
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
    private final SearchService searchService;
    private final AuditService auditService;

    @Transactional
    public DocumentResponseDto uploadNewDocument(String title, String description, MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();

        Department userDepartment = currentUser.getDepartment();
        if (Objects.isNull(userDepartment)) {
            throw new IllegalStateException("Cannot upload document: User '" + currentUser.getUsername() + "' is not assigned to a department.");
        }

        String s3ObjectKey = buildS3Key(userDepartment.getId(), file.getOriginalFilename());

        fileStorageService.uploadFile(s3ObjectKey, file);

        Document document = new Document();
        document.setTitle(title);
        document.setDescription(description);
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
        searchService.indexDocument(version, file);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Uploaded new document '%s' (ID: %d) with filename '%s'.",
                title, savedDocument.getId(), file.getOriginalFilename());
        auditService.recordEvent(currentUser.getUsername(), "DOCUMENT_UPLOAD", auditDetails);
        // ---------------------

        return mapToDocumentResponseDto(savedDocument);
    }

    @Transactional
    public DocumentResponseDto uploadNewVersion(Long documentId, MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        // Security Check: Ensure user is in the correct department
        if (!Objects.equals(document.getDepartment().getId(), currentUser.getDepartment().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to update this document.");
        }

        // Determine the new version number
        Integer latestVersionNumber = document.getLatestVersion().getVersionNumber();
        Integer newVersionNumber = latestVersionNumber + 1;

        // Construct a new unique S3 key
        String s3ObjectKey = buildS3Key(document.getDepartment().getId(), file.getOriginalFilename());

        // Upload the new file version to S3
        fileStorageService.uploadFile(s3ObjectKey, file);

        // Create the new DocumentVersion entity
        DocumentVersion newVersion = new DocumentVersion();
        newVersion.setDocument(document);
        newVersion.setVersionNumber(newVersionNumber);
        newVersion.setS3ObjectKey(s3ObjectKey);
        newVersion.setFileType(file.getContentType());
        newVersion.setSizeInBytes(file.getSize());
        newVersion.setUploadTimestamp(LocalDateTime.now());
        newVersion.setUploader(currentUser);

        // Add the new version to the document's version list
        document.getVersions().add(newVersion);
        // CRUCIAL: Update the pointer to the latest version
        document.setLatestVersion(newVersion);

        // Save the parent document. Cascade will save the new version.
        Document updatedDocument = documentRepository.save(document);
        searchService.indexDocument(newVersion, file);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Uploaded new version (v%d) for document '%s' (ID: %d).",
                newVersion.getVersionNumber(), updatedDocument.getTitle(), documentId);
        auditService.recordEvent(currentUser.getUsername(), "DOCUMENT_NEW_VERSION", auditDetails);
        // ---------------------

        return mapToDocumentResponseDto(updatedDocument);
    }

    public List<DocumentResponseDto> getDocumentsForCurrentUserDepartment() {
        User currentUser = getCurrentUser();
        Department userDepartment = currentUser.getDepartment();

        if (Objects.isNull(userDepartment)) {
            return Collections.emptyList();
        }

        // --- USE THE NEW, EFFICIENT QUERY ---
        return documentRepository.findAllByDepartmentIdWithDetails(userDepartment.getId()).stream()
                .filter(doc -> doc.getStatus() == DocumentStatus.ACTIVE)
                .map(this::mapToDocumentResponseDto)
                .collect(Collectors.toList());
    }

    // ---  METHOD: Get a single document's details ---
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

        if (!document.getDepartment().getId().equals(currentUser.getDepartment().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this document.");
        }

        document.setStatus(DocumentStatus.PENDING_DELETION);
        document.setDeletionRequester(currentUser);
        document.setDeletionRequestedAt(LocalDateTime.now());

        documentRepository.save(document);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Requested deletion for document '%s' (ID: %d).", document.getTitle(), documentId);
        auditService.recordEvent(currentUser.getUsername(), "DOCUMENT_DELETE_REQUEST", auditDetails);
        // ---------------------
    }

    // --- METHOD: Get all documents pending deletion ---
    public List<DocumentApprovalDto> getPendingDeletionDocuments() {
        // This now calls the efficient, custom query that directly returns the DTOs
        return documentRepository.findDocumentsPendingDeletion();
    }

    @Transactional
    public void approveDeletion(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (document.getStatus() != DocumentStatus.PENDING_DELETION) {
            throw new IllegalStateException("Document is not pending deletion.");
        }

        document.setStatus(DocumentStatus.ARCHIVED);
        documentRepository.save(document);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Approved deletion for document '%s' (ID: %d), originally requested by '%s'.",
                document.getTitle(), documentId, document.getDeletionRequester().getUsername());
        auditService.recordEvent(getCurrentUsername(), "DOCUMENT_DELETE_APPROVE", auditDetails);
        // ---------------------
    }

    @Transactional
    public void rejectDeletion(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (document.getStatus() != DocumentStatus.PENDING_DELETION) {
            throw new IllegalStateException("Document is not pending deletion.");
        }

        document.setStatus(DocumentStatus.ACTIVE);
        document.setDeletionRequester(null);
        document.setDeletionRequestedAt(null);
        documentRepository.save(document);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Rejected deletion for document '%s' (ID: %d).", document.getTitle(), documentId);
        auditService.recordEvent(getCurrentUsername(), "DOCUMENT_DELETE_REJECT", auditDetails);
        // ---------------------
    }

    private DocumentApprovalDto mapToDocumentApprovalDto(Document doc) {
        return DocumentApprovalDto.builder()
                .documentId(doc.getId())
                .title(doc.getTitle())
                .requesterUsername(doc.getDeletionRequester() != null ? doc.getDeletionRequester().getUsername() : "N/A")
                .departmentName(doc.getDepartment() != null ? doc.getDepartment().getName() : "N/A")
                .requestedAt(doc.getDeletionRequestedAt())
                .build();
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
                .title(doc.getTitle())
                .description(doc.getDescription())
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

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}