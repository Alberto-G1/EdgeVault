package com.edgevault.edgevaultbackend.service.dashboard;

import com.edgevault.dto.dashboard.TopUserActivityDto;
import com.edgevault.edgevaultbackend.dto.dashboard.*;
import com.edgevault.edgevaultbackend.model.audit.AuditLog;
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.document.DocumentStatus;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.audit.AuditLogRepository;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;

    public List<StatCardDto> getStatistics() {
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has admin permissions
        boolean isAdmin = hasAdminPermissions();
        
        List<StatCardDto> stats = new ArrayList<>();

        if (isAdmin) {
            // Admin sees all stats
            // 1. Total Users
            long totalUsers = userRepository.count();
            stats.add(new StatCardDto("Total Users", totalUsers, ""));

            // 2. Total Documents
            long totalDocuments = documentRepository.count();
            stats.add(new StatCardDto("Total Documents", totalDocuments, ""));

            // 3. Total Logins
            long totalLogins = auditLogRepository.countByAction("USER_LOGIN_SUCCESS");
            stats.add(new StatCardDto("Total Logins Today", totalLogins, ""));

            // 4. Pending Approvals
            long pendingApprovals = documentRepository.countByStatus(com.edgevault.edgevaultbackend.model.document.DocumentStatus.PENDING_DELETION);
            stats.add(new StatCardDto("Pending Approvals", pendingApprovals, ""));
        } else {
            // Regular users see their own stats
            // 1. My Documents (uploaded by this user)
            long myDocuments = documentRepository.countByLatestVersion_Uploader(currentUser);
            stats.add(new StatCardDto("My Documents", myDocuments, ""));

            // 2. My Activity (audit logs for this user)
            long myActivity = auditLogRepository.countByUsername(currentUsername);
            stats.add(new StatCardDto("My Activity", myActivity, ""));
        }

        return stats;
    }

    public List<RecentActivityDto> getRecentActivities() {
        String currentUsername = getCurrentUsername();
        boolean isAdmin = hasAdminPermissions();
        
        if (isAdmin) {
            // Admin sees all recent activities
            return auditLogRepository.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp")))
                    .stream()
                    .map(log -> new RecentActivityDto(
                            log.getUsername(),
                            log.getAction(),
                            log.getDetails(),
                            log.getTimestamp()
                    ))
                    .collect(Collectors.toList());
        } else {
            // Regular users see only their own activities
            return auditLogRepository.findByUsername(currentUsername, PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp")))
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
    
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    
    private boolean hasAdminPermissions() {
        Collection<? extends GrantedAuthority> authorities = 
            SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        
        // Check for any admin-level permissions
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> 
                    auth.equals("USER_CREATE") || 
                    auth.equals("USER_UPDATE") || 
                    auth.equals("USER_DELETE") || 
                    auth.equals("ROLE_CREATE") ||
                    auth.equals("DEPARTMENT_CREATE")
                );
    }
    
    // ============== VISUALIZATION METHODS ==============
    
    // 1. Documents by Department (Donut Chart)
    public List<DepartmentDocumentCountDto> getDocumentsByDepartment() {
        List<Document> allDocuments = documentRepository.findAll();
        Map<String, Long> departmentCounts = allDocuments.stream()
                .collect(Collectors.groupingBy(
                        doc -> doc.getDepartment() != null ? doc.getDepartment().getName() : "Unassigned",
                        Collectors.counting()
                ));
        
        return departmentCounts.entrySet().stream()
                .map(entry -> new DepartmentDocumentCountDto(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.getDocumentCount(), a.getDocumentCount()))
                .collect(Collectors.toList());
    }
    
    // 2. Recent User Activity - Last 7 Days (Bar Chart)
    public List<DailyActivityDto> getDailyActivityLast7Days() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<AuditLog> recentLogs = auditLogRepository.findByTimestampAfter(sevenDaysAgo);
        
        Map<String, Long> dailyCounts = recentLogs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getTimestamp().toLocalDate().toString(),
                        Collectors.counting()
                ));
        
        List<DailyActivityDto> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.toString();
            long count = dailyCounts.getOrDefault(dateStr, 0L);
            result.add(new DailyActivityDto(dateStr, count));
        }
        
        return result;
    }
    
    // 3. Document Growth Over Time (Line Chart)
    public List<DocumentGrowthDto> getDocumentGrowthOverTime() {
        List<Document> allDocuments = documentRepository.findAll();
        
        // Group documents by month of creation
        Map<String, Long> monthlyGrowth = new TreeMap<>();
        
        for (Document doc : allDocuments) {
            if (doc.getLatestVersion() != null && doc.getLatestVersion().getUploadTimestamp() != null) {
                LocalDateTime uploadTime = doc.getLatestVersion().getUploadTimestamp();
                String monthKey = uploadTime.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                monthlyGrowth.put(monthKey, monthlyGrowth.getOrDefault(monthKey, 0L) + 1);
            }
        }
        
        // Calculate cumulative counts
        long cumulative = 0;
        List<DocumentGrowthDto> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : monthlyGrowth.entrySet()) {
            cumulative += entry.getValue();
            result.add(new DocumentGrowthDto(entry.getKey(), cumulative));
        }
        
        return result;
    }
    
    // 4. Documents by Status (Horizontal Bar Chart)
    public List<DocumentStatusCountDto> getDocumentsByStatus() {
        List<Document> allDocuments = documentRepository.findAll();
        
        Map<String, Long> statusCounts = allDocuments.stream()
                .collect(Collectors.groupingBy(
                        doc -> doc.getStatus() != null ? doc.getStatus().toString() : "UNKNOWN",
                        Collectors.counting()
                ));
        
        return statusCounts.entrySet().stream()
                .map(entry -> new DocumentStatusCountDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }
    
    // 5. Document Types Distribution (Treemap)
    public List<FileTypeDistributionDto> getFileTypeDistribution() {
        List<Document> allDocuments = documentRepository.findAll();
        
        Map<String, List<Document>> fileTypeGroups = allDocuments.stream()
                .filter(doc -> doc.getLatestVersion() != null)
                .collect(Collectors.groupingBy(
                        doc -> doc.getLatestVersion().getFileType() != null ? 
                               doc.getLatestVersion().getFileType().toUpperCase() : "UNKNOWN"
                ));
        
        return fileTypeGroups.entrySet().stream()
                .map(entry -> {
                    String fileType = entry.getKey();
                    long count = entry.getValue().size();
                    long totalSize = entry.getValue().stream()
                            .mapToLong(doc -> doc.getLatestVersion().getSizeInBytes())
                            .sum();
                    return new FileTypeDistributionDto(fileType, count, totalSize);
                })
                .sorted((a, b) -> Long.compare(b.getTotalSize(), a.getTotalSize()))
                .collect(Collectors.toList());
    }
    
    // 6. System Activity by Hour of Day (Heat Map)
    public List<ActivityHeatMapDto> getActivityHeatMap() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<AuditLog> recentLogs = auditLogRepository.findByTimestampAfter(thirtyDaysAgo);
        
        Map<String, Long> heatMapData = recentLogs.stream()
                .collect(Collectors.groupingBy(
                        log -> {
                            int dayOfWeek = log.getTimestamp().getDayOfWeek().getValue(); // 1-7
                            int hour = log.getTimestamp().getHour(); // 0-23
                            return dayOfWeek + "-" + hour;
                        },
                        Collectors.counting()
                ));
        
        List<ActivityHeatMapDto> result = new ArrayList<>();
        for (int day = 1; day <= 7; day++) {
            for (int hour = 0; hour < 24; hour++) {
                String key = day + "-" + hour;
                long count = heatMapData.getOrDefault(key, 0L);
                result.add(new ActivityHeatMapDto(day, hour, count));
            }
        }
        
        return result;
    }
    
    // 7. Stale Documents (Not Modified in 90+ Days)
    public List<StaleDocumentDto> getStaleDocuments(int daysThreshold) {
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(daysThreshold);
        List<Document> allDocuments = documentRepository.findAll();
        
        return allDocuments.stream()
                .filter(doc -> doc.getLatestVersion() != null && 
                              doc.getLatestVersion().getUploadTimestamp() != null &&
                              doc.getLatestVersion().getUploadTimestamp().isBefore(thresholdDate))
                .map(doc -> {
                    LocalDateTime lastModified = doc.getLatestVersion().getUploadTimestamp();
                    long daysSince = ChronoUnit.DAYS.between(lastModified, LocalDateTime.now());
                    return new StaleDocumentDto(
                            doc.getId(),
                            doc.getTitle(),
                            doc.getDepartment() != null ? doc.getDepartment().getName() : "Unassigned",
                            lastModified,
                            daysSince
                    );
                })
                .sorted((a, b) -> Long.compare(b.getDaysSinceModified(), a.getDaysSinceModified()))
                .limit(100) // Return top 100 stale documents
                .collect(Collectors.toList());
    }
    
    // 8. Top 5 Most Active Users
    public List<TopUserActivityDto> getTopActiveUsers() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<AuditLog> recentLogs = auditLogRepository.findByTimestampAfter(thirtyDaysAgo);
        
        // Group by username and count activities
        Map<String, Long> userActivityCount = recentLogs.stream()
                .filter(log -> log.getUsername() != null && !log.getUsername().isEmpty())
                .collect(Collectors.groupingBy(
                        AuditLog::getUsername,
                        Collectors.counting()
                ));
        
        // Get top 5 users and fetch their details
        return userActivityCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    User user = userRepository.findByUsername(entry.getKey())
                            .orElse(null);
                    if (user != null) {
                        String fullName = user.getFirstName() + " " + user.getLastName();
                        return new TopUserActivityDto(
                                user.getId(),
                                user.getUsername(),
                                fullName,
                                entry.getValue()
                        );
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}