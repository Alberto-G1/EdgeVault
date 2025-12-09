package com.edgevault.edgevaultbackend.repository.audit;

import com.edgevault.edgevaultbackend.model.audit.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Custom query to find the single latest log entry
    Optional<AuditLog> findTopByOrderByIdDesc();
}