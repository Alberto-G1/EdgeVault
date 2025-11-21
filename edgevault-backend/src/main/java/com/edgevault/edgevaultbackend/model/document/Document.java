package com.edgevault.edgevaultbackend.model.document;

import com.edgevault.edgevaultbackend.model.department.Department;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    @ManyToOne(fetch = FetchType.LAZY, nullable = false)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<DocumentVersion> versions = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "latest_version_id")
    private DocumentVersion latestVersion;
}