package com.edgevault.edgevaultbackend.service.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.dto.document.DocumentVersionDto;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.department.Department; // <-- Import if not present
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections; // <-- Import for Collections.emptyList()
import java.util.List;
import java.util.Objects; // <-- Import Objects
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public DocumentResponseDto uploadNewDocument(MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();

        // --- THIS IS THE FIX ---
        // Verify that the user belongs to a department before proceeding.
        Department userDepartment = currentUser.getDepartment();
        if (Objects.isNull(userDepartment)) {
            throw new IllegalStateException("Cannot upload document: User '" + currentUser.getUsername() + "' is not assigned to a department.");
        }
        // -------------------------

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

        // If user has no department, they can see no documents.
        if (Objects.isNull(userDepartment)) {
            return Collections.emptyList();
        }

        return documentRepository.findByDepartmentId(userDepartment.getId()).stream()
                .map(this::mapToDocumentResponseDto)
                .collect(Collectors.toList());
    }

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