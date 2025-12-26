package com.edgevault.edgevaultbackend.controller.dashboard;

import com.edgevault.edgevaultbackend.dto.dashboard.RecentActivityDto;
import com.edgevault.edgevaultbackend.dto.dashboard.StatCardDto;
import com.edgevault.edgevaultbackend.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}