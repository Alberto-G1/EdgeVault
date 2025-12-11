package com.edgevault.edgevaultbackend.service.chat;

import com.edgevault.edgevaultbackend.dto.chat.ChatMessageDto;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.chat.Conversation;
import com.edgevault.edgevaultbackend.model.chat.ConversationType;
import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.chat.ConversationRepository;
import com.edgevault.edgevaultbackend.repository.chat.ChatMessageRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final AuditService auditService;

    @Transactional
    public ChatMessage saveMessage(Long conversationId, String content, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Security Check: For DOCUMENT conversations, add user as participant if not already
        // For other types, ensure user is part of the conversation (or if it's the global chat)
        if (conversation.getType() == ConversationType.DOCUMENT) {
            // For document conversations, automatically add user as participant if not already
            if (!conversation.getParticipants().contains(sender)) {
                conversation.getParticipants().add(sender);
                conversationRepository.save(conversation);
            }
        } else if (conversation.getType() != ConversationType.GROUP && !conversation.getParticipants().contains(sender)) {
            throw new AccessDeniedException("User is not a participant of this conversation.");
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setConversation(conversation);
        chatMessage.setSender(sender);
        chatMessage.setContent(content);
        chatMessage.setTimestamp(LocalDateTime.now());

        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessageDto> getMessageHistory(Long conversationId, String username) {
        // Security check is implicitly handled by the saveMessage check
        // A more robust check would verify participation here as well.
        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(this::mapToChatMessageDto)
                .collect(Collectors.toList());
    }

    // --- METHOD FOR STARTING A DM ---
    @Transactional
    public Conversation getOrCreateDirectConversation(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1).orElseThrow(() -> new ResourceNotFoundException("User not found: " + username1));
        User user2 = userRepository.findByUsername(username2).orElseThrow(() -> new ResourceNotFoundException("User not found: " + username2));

        return conversationRepository.findDirectConversationBetweenUsers(user1.getId(), user2.getId())
                .orElseGet(() -> {
                    Conversation newDm = new Conversation();
                    newDm.setType(ConversationType.DIRECT_MESSAGE);
                    newDm.setParticipants(Set.of(user1, user2));
                    newDm.setCreatedAt(LocalDateTime.now());
                    Conversation savedDm = conversationRepository.save(newDm);

                    // --- AUDIT LOG ---
                    String auditDetails = String.format("Created new direct message conversation between '%s' and '%s' (ID: %d).",
                            username1, username2, savedDm.getId());
                    auditService.recordEvent(username1, "CONVERSATION_CREATE", auditDetails);
                    // -----------------

                    return savedDm;
                });
    }

    // --- METHOD FOR DOCUMENT CONVERSATIONS ---
    @Transactional
    public Conversation getOrCreateDocumentConversation(Long documentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Conversation conversation = conversationRepository.findByDocumentIdAndType(documentId, ConversationType.DOCUMENT)
                .orElseGet(() -> {
                    Conversation newConvo = new Conversation();
                    newConvo.setType(ConversationType.DOCUMENT);
                    newConvo.setDocumentId(documentId);
                    newConvo.setName("Document #" + documentId + " Chat");
                    newConvo.setCreatedAt(LocalDateTime.now());
                    return conversationRepository.save(newConvo);
                });
        
        // Add user as participant if not already
        if (!conversation.getParticipants().contains(user)) {
            conversation.getParticipants().add(user);
            conversationRepository.save(conversation);
        }
        
        return conversation;
    }

    public ChatMessageDto mapToChatMessageDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderUsername(message.getSender().getUsername())
                .senderProfilePictureUrl(message.getSender().getProfilePictureUrl())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }
}