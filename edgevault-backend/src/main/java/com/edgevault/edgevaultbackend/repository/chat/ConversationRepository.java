package com.edgevault.edgevaultbackend.repository.chat;

import com.edgevault.edgevaultbackend.model.chat.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByName(String name);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
            "WHERE c.type = com.edgevault.edgevaultbackend.model.chat.ConversationType.DIRECT_MESSAGE " +
            "AND p1.id = :userId1 AND p2.id = :userId2")
    Optional<Conversation> findDirectConversationBetweenUsers(Long userId1, Long userId2);

    List<Conversation> findByParticipants_Id(Long userId);
}