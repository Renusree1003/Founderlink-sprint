package com.pro.messaging_service.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pro.messaging_service.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUser1IdOrUser2Id(Long user1Id, Long user2Id);
}