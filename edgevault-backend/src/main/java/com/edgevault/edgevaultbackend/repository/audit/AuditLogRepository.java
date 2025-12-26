package com.edgevault.edgevaultbackend.repository.audit;

import com.edgevault.edgevaultbackend.model.audit.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Custom query to find the single latest log entry
    Optional<AuditLog> findTopByOrderByIdDesc();

    // --- COUNT METHOD ---
    long countByAction(String action);
    
    // Count audit logs by username
    long countByUsername(String username);
    
    // Find audit logs by username with pagination
    List<AuditLog> findByUsername(String username, Pageable pageable);
}