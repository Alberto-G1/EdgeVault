package com.edgevault.edgevaultbackend.repository.chat;

import com.edgevault.edgevaultbackend.model.chat.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND NOT EXISTS (SELECT mrs FROM MessageReadStatus mrs WHERE mrs.message.id = m.id AND mrs.user.id = :userId)")
    long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT mrs FROM MessageReadStatus mrs WHERE mrs.message.id = :messageId AND mrs.user.id = :userId")
    Optional<MessageReadStatus> findByMessageIdAndUserId(@Param("messageId") Long messageId, @Param("userId") Long userId);

    boolean existsByMessageIdAndUserId(Long messageId, Long userId);
}
