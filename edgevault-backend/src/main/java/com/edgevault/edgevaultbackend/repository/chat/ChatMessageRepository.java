package com.edgevault.edgevaultbackend.repository.chat;

import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByTimestampAsc(Long conversationId);
}