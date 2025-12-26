package com.edgevault.edgevaultbackend.service.dashboard;

import com.edgevault.edgevaultbackend.dto.dashboard.RecentActivityDto;
import com.edgevault.edgevaultbackend.dto.dashboard.StatCardDto;
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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
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
}