package com.edgevault.edgevaultbackend.controller.search;

import com.edgevault.edgevaultbackend.dto.document.DocumentResponseDto;
import com.edgevault.edgevaultbackend.service.search.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<?> search(@RequestParam("q") String query) {
        try {
            log.info("Received search request with query: '{}'", query);
            
            if (query == null || query.isBlank()) {
                log.warn("Empty search query received");
                return ResponseEntity.badRequest().body(Map.of("error", "Search query cannot be empty"));
            }
            
            List<DocumentResponseDto> results = searchService.searchDocuments(query);
            log.info("Search completed successfully, returning {} results", results.size());
            return ResponseEntity.ok(results);
            
        } catch (IllegalStateException e) {
            log.error("User authentication error during search", e);
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error performing search for query: '{}'", query, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "error", "Error performing search",
                        "message", e.getMessage(),
                        "type", e.getClass().getSimpleName()
                    ));
        }
    }
}