package com.edgevault.edgevaultbackend.service.dashboard;

import com.edgevault.edgevaultbackend.dto.dashboard.RecentActivityDto;
import com.edgevault.edgevaultbackend.dto.dashboard.StatCardDto;
import com.edgevault.edgevaultbackend.repository.audit.AuditLogRepository;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;

    public List<StatCardDto> getStatistics() {
        List<StatCardDto> stats = new ArrayList<>();

        // 1. Total Users
        long totalUsers = userRepository.count();
        stats.add(new StatCardDto("Total Users", totalUsers, ""));

        // 2. Total Documents
        long totalDocuments = documentRepository.count();
        stats.add(new StatCardDto("Total Documents", totalDocuments, ""));

        // 3. Total Logins (Example - from audit log)
        long totalLogins = auditLogRepository.countByAction("USER_LOGIN_SUCCESS");
        stats.add(new StatCardDto("Total Logins Today", totalLogins, "")); // Logic for "Today" can be added

        // 4. Pending Approvals
        long pendingApprovals = documentRepository.countByStatus(com.edgevault.edgevaultbackend.model.document.DocumentStatus.PENDING_DELETION);
        stats.add(new StatCardDto("Pending Approvals", pendingApprovals, ""));

        return stats;
    }

    public List<RecentActivityDto> getRecentActivities() {
        // Fetch the 10 most recent audit logs
        return auditLogRepository.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp")))
                .stream()
                .map(log -> new RecentActivityDto(
                        log.getUsername(),
                        log.getAction(),
                        log.getDetails(),
                        log.getTimestamp()
                ))
                .collect(Collectors.toList());
    }
}