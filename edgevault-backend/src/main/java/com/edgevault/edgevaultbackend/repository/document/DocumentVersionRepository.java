package com.edgevault.edgevaultbackend.repository.document;

import com.edgevault.edgevaultbackend.model.document.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    // We can add custom query methods here in the future if needed,
    // for example: findByUploaderId(Long uploaderId);
}