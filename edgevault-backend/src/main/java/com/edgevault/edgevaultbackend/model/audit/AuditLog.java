package com.edgevault.edgevaultbackend.model.audit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // Who performed the action

    @Column(nullable = false)
    private String action; // e.g., "USER_LOGIN", "DOCUMENT_UPLOAD"

    @Lob
    @Column(columnDefinition = "TEXT")
    private String details; // e.g., "User 'testuser' uploaded document 'report.pdf' (ID: 123)"

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 64) // SHA-256 hash
    private String previousHash; // Hash of the previous log entry

    @Column(length = 64, unique = true) // SHA-256 hash
    private String currentHash; // Hash of this log entry's data + previousHash
}