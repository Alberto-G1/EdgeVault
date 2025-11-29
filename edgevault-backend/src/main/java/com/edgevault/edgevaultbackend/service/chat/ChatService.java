package com.edgevault.edgevaultbackend.service.chat;

import com.edgevault.edgevaultbackend.dto.chat.ChatMessageDto;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import com.edgevault.edgevaultbackend.model.document.Document;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.chat.ChatMessageRepository;
import com.edgevault.edgevaultbackend.repository.document.DocumentRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessage saveMessage(Long documentId, String content, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Security Check: Ensure sender has access to the document's department
        if (!sender.getDepartment().getId().equals(document.getDepartment().getId())) {
            throw new AccessDeniedException("User does not have access to this document's chat.");
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setDocument(document);
        chatMessage.setSender(sender);
        chatMessage.setContent(content);
        chatMessage.setTimestamp(LocalDateTime.now());

        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessageDto> getMessageHistory(Long documentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Security Check
        if (!user.getDepartment().getId().equals(document.getDepartment().getId())) {
            throw new AccessDeniedException("User does not have access to this document's chat history.");
        }

        return chatMessageRepository.findByDocumentIdOrderByTimestampAsc(documentId).stream()
                .map(this::mapToChatMessageDto)
                .collect(Collectors.toList());
    }

    public ChatMessageDto mapToChatMessageDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .documentId(message.getDocument().getId())
                .senderUsername(message.getSender().getUsername())
                .senderProfilePictureUrl(message.getSender().getProfilePictureUrl())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }
}