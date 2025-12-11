package com.edgevault.edgevaultbackend.model.document;

import com.edgevault.edgevaultbackend.model.user.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    @JsonBackReference // This is the "child" side, it won't be serialized
    private Document document;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, unique = true)
    private String s3ObjectKey;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private Long sizeInBytes;

    @Column(nullable = false)
    private LocalDateTime uploadTimestamp;

    // --- AND THIS IS THE FIX ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Use optional = false
    @JoinColumn(name = "uploader_id")
    private User uploader;

    @Column(length = 1000)
    private String description;
}