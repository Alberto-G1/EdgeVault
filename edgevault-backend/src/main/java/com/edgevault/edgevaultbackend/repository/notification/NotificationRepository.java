package com.edgevault.edgevaultbackend.repository.notification;

import com.edgevault.edgevaultbackend.model.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a specific user, ordered by newest first
    List<Notification> findByRecipientIdOrderByTimestampDesc(Long recipientId);

    // Count unread notifications for a user
    long countByRecipientIdAndIsReadFalse(Long recipientId);
}