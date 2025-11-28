package com.edgevault.edgevaultbackend.repository.search;

import com.edgevault.edgevaultbackend.model.search.DocumentSearch;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentSearchRepository extends ElasticsearchRepository<DocumentSearch, String> {
    // Spring Data Elasticsearch will auto-generate search methods based on the name
}