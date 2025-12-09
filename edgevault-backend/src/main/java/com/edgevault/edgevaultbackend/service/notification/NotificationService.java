package com.edgevault.edgevaultbackend.service.notification;

import com.edgevault.edgevaultbackend.model.notification.Notification;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Creates and sends a notification to a specific user.
     * This method is asynchronous to avoid blocking the main application thread.
     */
    @Async
    public void createAndSendNotification(User recipient, String message, String link) {
        if (recipient == null) {
            return; // Don't send notifications to a null user
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);

        // Send the notification over a user-specific WebSocket topic
        // The username is a unique, private channel for this user.
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/topic/notifications",
                savedNotification
        );
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientIdOrderByTimestampDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security check: ensure the notification belongs to the user trying to mark it as read
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new SecurityException("User does not have permission to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}