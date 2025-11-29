package com.edgevault.edgevaultbackend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long documentId;
    private String senderUsername;
    private String senderProfilePictureUrl; // For the UI
    private String content;
    private LocalDateTime timestamp;
}