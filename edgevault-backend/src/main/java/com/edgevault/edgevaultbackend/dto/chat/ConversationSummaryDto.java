package com.edgevault.edgevaultbackend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryDto {
    private Long id;
    private String name;
    private String type;
    private Long documentId;
    private String lastMessage;
    private String lastMessageTime;
    private String lastMessageSender;
    private long unreadCount;
    private String otherParticipantUsername;
    private String otherParticipantProfilePicture;
}
