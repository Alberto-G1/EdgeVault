package com.edgevault.edgevaultbackend.controller.dashboard;

import com.edgevault.dto.dashboard.TopUserActivityDto;
import com.edgevault.edgevaultbackend.dto.dashboard.*;
import com.edgevault.edgevaultbackend.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<List<StatCardDto>> getStats() {
        return ResponseEntity.ok(dashboardService.getStatistics());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivity() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }
    
    // ============== VISUALIZATION ENDPOINTS ==============
    
    @GetMapping("/visualizations/documents-by-department")
    public ResponseEntity<List<DepartmentDocumentCountDto>> getDocumentsByDepartment() {
        return ResponseEntity.ok(dashboardService.getDocumentsByDepartment());
    }
    
    @GetMapping("/visualizations/daily-activity")
    public ResponseEntity<List<DailyActivityDto>> getDailyActivity() {
        return ResponseEntity.ok(dashboardService.getDailyActivityLast7Days());
    }
    
    @GetMapping("/visualizations/document-growth")
    public ResponseEntity<List<DocumentGrowthDto>> getDocumentGrowth() {
        return ResponseEntity.ok(dashboardService.getDocumentGrowthOverTime());
    }
    
    @GetMapping("/visualizations/documents-by-status")
    public ResponseEntity<List<DocumentStatusCountDto>> getDocumentsByStatus() {
        return ResponseEntity.ok(dashboardService.getDocumentsByStatus());
    }
    
    @GetMapping("/visualizations/file-type-distribution")
    public ResponseEntity<List<FileTypeDistributionDto>> getFileTypeDistribution() {
        return ResponseEntity.ok(dashboardService.getFileTypeDistribution());
    }
    
    @GetMapping("/visualizations/activity-heatmap")
    public ResponseEntity<List<ActivityHeatMapDto>> getActivityHeatMap() {
        return ResponseEntity.ok(dashboardService.getActivityHeatMap());
    }
    
    @GetMapping("/visualizations/stale-documents")
    public ResponseEntity<List<StaleDocumentDto>> getStaleDocuments(
            @RequestParam(defaultValue = "90") int daysThreshold) {
        return ResponseEntity.ok(dashboardService.getStaleDocuments(daysThreshold));
    }
    
    @GetMapping("/visualizations/top-active-users")
    public ResponseEntity<List<TopUserActivityDto>> getTopActiveUsers() {
        return ResponseEntity.ok(dashboardService.getTopActiveUsers());
    }
}