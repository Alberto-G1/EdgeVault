package com.edgevault.edgevaultbackend.repository.document;

import com.edgevault.edgevaultbackend.dto.document.DocumentApprovalDto; // <-- IMPORT
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.document.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d " +
            "LEFT JOIN FETCH d.department " +
            "LEFT JOIN FETCH d.latestVersion lv " +
            "LEFT JOIN FETCH lv.uploader " +
            "LEFT JOIN FETCH d.deletionRequester " +
            "WHERE d.department.id = :departmentId")
    List<Document> findAllByDepartmentIdWithDetails(Long departmentId);

    @Query("SELECT new com.edgevault.edgevaultbackend.dto.document.DocumentApprovalDto(" +
            "d.id, d.title, dr.username, dep.name, d.deletionRequestedAt) " +
            "FROM Document d " +
            "LEFT JOIN d.deletionRequester dr " +
            "LEFT JOIN d.department dep " +
            "WHERE d.status = com.edgevault.edgevaultbackend.model.document.DocumentStatus.PENDING_DELETION")
    List<DocumentApprovalDto> findDocumentsPendingDeletion();

    List<Document> findByDepartmentId(Long departmentId);

    long countByStatus(DocumentStatus status);
}