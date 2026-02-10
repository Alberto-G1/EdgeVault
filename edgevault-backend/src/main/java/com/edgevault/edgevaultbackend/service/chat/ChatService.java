package com.edgevault.edgevaultbackend.service.chat;

import com.edgevault.edgevaultbackend.dto.chat.ChatMessageDto;
import com.edgevault.edgevaultbackend.dto.chat.ConversationSummaryDto;
import com.edgevault.edgevaultbackend.dto.chat.UserPresenceDto;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.chat.*;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.chat.ConversationRepository;
import com.edgevault.edgevaultbackend.repository.chat.ChatMessageRepository;
import com.edgevault.edgevaultbackend.repository.chat.MessageReadStatusRepository;
import com.edgevault.edgevaultbackend.repository.chat.UserPresenceRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageReadStatusRepository messageReadStatusRepository;
    private final UserPresenceRepository userPresenceRepository;
    private final AuditService auditService;

    @Transactional
    public ChatMessage saveMessage(Long conversationId, String content, String senderUsername) {
        // Validate message content
        String validatedContent = ValidationUtil.validateChatMessageContent(content);
        
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
        chatMessage.setContent(validatedContent);
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
        // Count how many users have read this message
        long readCount = messageReadStatusRepository.findAll().stream()
                .filter(mrs -> mrs.getMessage().getId().equals(message.getId()))
                .count();
        
        // Calculate total recipients (exclude sender)
        long totalRecipients = message.getConversation().getType() == ConversationType.GROUP 
                ? userRepository.count() - 1 
                : message.getConversation().getParticipants().size() - 1;
        
        return ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderUsername(message.getSender().getUsername())
                .senderProfilePictureUrl(message.getSender().getProfilePictureUrl())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .readCount(readCount)
                .totalRecipients(totalRecipients)
                .build();
    }

    // --- GROUP CHAT MANAGEMENT ---
    @Transactional
    public Conversation getOrCreateGroupConversation() {
        return conversationRepository.findAll().stream()
                .filter(c -> c.getType() == ConversationType.GROUP)
                .findFirst()
                .orElseGet(() -> {
                    Conversation groupChat = new Conversation();
                    groupChat.setType(ConversationType.GROUP);
                    groupChat.setName("Global Chat");
                    groupChat.setCreatedAt(LocalDateTime.now());
                    return conversationRepository.save(groupChat);
                });
    }

    // --- CONVERSATION LISTING ---
    public List<ConversationSummaryDto> getAllConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Conversation> conversations = conversationRepository.findAll().stream()
                .filter(c -> c.getType() == ConversationType.GROUP || 
                           (c.getType() == ConversationType.DIRECT_MESSAGE && c.getParticipants().contains(user)))
                .collect(Collectors.toList());

        return conversations.stream()
                .map(c -> buildConversationSummary(c, user))
                .sorted(Comparator.comparing(ConversationSummaryDto::getLastMessageTime, 
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private ConversationSummaryDto buildConversationSummary(Conversation conversation, User currentUser) {
        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversation.getId());
        ChatMessage lastMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1);
        
        long unreadCount = messageReadStatusRepository.countUnreadMessages(conversation.getId(), currentUser.getId());

        ConversationSummaryDto.ConversationSummaryDtoBuilder builder = ConversationSummaryDto.builder()
                .id(conversation.getId())
                .type(conversation.getType().toString())
                .documentId(conversation.getDocumentId())
                .unreadCount(unreadCount);

        if (conversation.getType() == ConversationType.DIRECT_MESSAGE) {
            User otherUser = conversation.getParticipants().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(null);
            
            if (otherUser != null) {
                builder.name(otherUser.getUsername())
                       .otherParticipantUsername(otherUser.getUsername())
                       .otherParticipantProfilePicture(otherUser.getProfilePictureUrl());
            }
        } else {
            builder.name(conversation.getName());
        }

        if (lastMessage != null) {
            builder.lastMessage(lastMessage.getContent())
                   .lastMessageTime(lastMessage.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                   .lastMessageSender(lastMessage.getSender().getUsername());
        }

        return builder.build();
    }

    // --- READ STATUS MANAGEMENT ---
    @Transactional
    public void markConversationAsRead(Long conversationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        
        for (ChatMessage message : messages) {
            if (!message.getSender().getId().equals(user.getId()) && 
                !messageReadStatusRepository.existsByMessageIdAndUserId(message.getId(), user.getId())) {
                
                MessageReadStatus readStatus = new MessageReadStatus();
                readStatus.setMessage(message);
                readStatus.setUser(user);
                readStatus.setReadAt(LocalDateTime.now());
                messageReadStatusRepository.save(readStatus);
            }
        }
    }

    public long getTotalUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Conversation> conversations = conversationRepository.findAll().stream()
                .filter(c -> c.getType() == ConversationType.GROUP || c.getParticipants().contains(user))
                .collect(Collectors.toList());

        return conversations.stream()
                .mapToLong(c -> messageReadStatusRepository.countUnreadMessages(c.getId(), user.getId()))
                .sum();
    }

    // --- USER SEARCH ---
    public List<User> searchUsers(String query, String currentUsername) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getUsername().equals(currentUsername))
                .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                           (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(query.toLowerCase())) ||
                           (u.getLastName() != null && u.getLastName().toLowerCase().contains(query.toLowerCase())))
                .limit(20)
                .collect(Collectors.toList());
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // --- PRESENCE MANAGEMENT ---
    @Transactional
    public void updateUserPresence(String username, UserPresence.PresenceStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserPresence presence = userPresenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserPresence newPresence = new UserPresence();
                    newPresence.setUser(user);
                    return newPresence;
                });

        presence.setStatus(status);
        presence.setUpdatedAt(LocalDateTime.now());
        if (status == UserPresence.PresenceStatus.OFFLINE) {
            presence.setLastSeen(LocalDateTime.now());
        }

        userPresenceRepository.save(presence);
    }

    public UserPresenceDto getUserPresence(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserPresence presence = userPresenceRepository.findByUserId(userId).orElse(null);

        return UserPresenceDto.builder()
                .userId(userId)
                .username(user.getUsername())
                .status(presence != null ? presence.getStatus().toString() : "OFFLINE")
                .lastSeen(presence != null ? presence.getLastSeen() : null)
                .build();
    }

    public List<UserPresenceDto> getAllUserPresences() {
        return userPresenceRepository.findAll().stream()
                .map(p -> UserPresenceDto.builder()
                        .userId(p.getUser().getId())
                        .username(p.getUser().getUsername())
                        .status(p.getStatus().toString())
                        .lastSeen(p.getLastSeen())
                        .build())
                .collect(Collectors.toList());
    }
}