package com.edgevault.edgevaultbackend.repository.document;

import com.edgevault.edgevaultbackend.model.document.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByDepartmentId(Long departmentId);
}