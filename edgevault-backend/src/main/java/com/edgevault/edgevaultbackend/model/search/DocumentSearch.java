package com.edgevault.edgevaultbackend.model.search;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;

@Data
@Builder
@Document(indexName = "edgevault_documents")
public class DocumentSearch {

    @Id
    private String id; // Use DocumentVersion ID as the unique ID in Elasticsearch

    @Field(type = FieldType.Long)
    private Long documentId;

    @Field(type = FieldType.Long)
    private Long departmentId;

    @Field(type = FieldType.Text, name = "title")
    private String title;

    @Field(type = FieldType.Text, name = "description")
    private String description;

    @Field(type = FieldType.Text, name = "fileName")
    private String originalFileName;

    @Field(type = FieldType.Text, name = "content")
    private String content; // <-- The extracted text from the document will go here

    @Field(type = FieldType.Keyword, name = "uploader")
    private String uploaderUsername;

    @Field(type = FieldType.Date, name = "uploadTimestamp")
    private LocalDateTime uploadTimestamp;

    @Field(type = FieldType.Integer, name = "versionNumber")
    private Integer versionNumber;
}