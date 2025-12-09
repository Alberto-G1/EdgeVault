package com.edgevault.edgevaultbackend.service.audit;

import com.edgevault.edgevaultbackend.model.audit.AuditLog;
import com.edgevault.edgevaultbackend.repository.audit.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // The method now accepts the username as a parameter.
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(String username, String action, String details) {
        // We no longer get the username from SecurityContextHolder here.

        String previousHash = auditLogRepository.findTopByOrderByIdDesc()
                .map(AuditLog::getCurrentHash)
                .orElse("0");

        LocalDateTime timestamp = LocalDateTime.now();
        String dataToHash = username + action + details + timestamp + previousHash;
        String currentHash = calculateSha256(dataToHash);

        AuditLog auditLog = new AuditLog();
        auditLog.setUsername(username); // Use the username passed as a parameter
        auditLog.setAction(action);
        auditLog.setDetails(details);
        auditLog.setTimestamp(timestamp);
        auditLog.setPreviousHash(previousHash);
        auditLog.setCurrentHash(currentHash);

        auditLogRepository.save(auditLog);
    }
    // -----------------------

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    private String calculateSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256"); // Was "SHA-266"
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // This exception should now never happen
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}