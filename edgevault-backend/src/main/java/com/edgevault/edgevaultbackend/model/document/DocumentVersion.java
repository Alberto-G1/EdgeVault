package com.edgevault.edgevaultbackend.model.document;

import com.edgevault.edgevaultbackend.model.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_versions")
@Getter
@Setter
@NoArgsConstructor
public class DocumentVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, nullable = false)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, unique = true)
    private String s3ObjectKey; // e.g., "department_id/document_id/uuid_filename.pdf"

    @Column(nullable = false)
    private String fileType; // e.g., "application/pdf"

    @Column(nullable = false)
    private Long sizeInBytes;

    @Column(nullable = false)
    private LocalDateTime uploadTimestamp;

    @ManyToOne(fetch = FetchType.LAZY, nullable = false)
    @JoinColumn(name = "uploader_id")
    private User uploader;
}