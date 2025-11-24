package com.edgevault.edgevaultbackend.model.document;

import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.model.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Use optional = false
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<DocumentVersion> versions = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    private LocalDateTime deletionRequestedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deletion_requester_id")
    private User deletionRequester;
    // It's good practice to make the latest version optional=true initially
    // as it can only be set *after* the first version is created.
    // However, for simplicity and because we do it in one transaction, we can leave it.
    // Let's remove the constraint for now to avoid potential transient state issues.
    @OneToOne
    @JoinColumn(name = "latest_version_id")
    private DocumentVersion latestVersion;
}