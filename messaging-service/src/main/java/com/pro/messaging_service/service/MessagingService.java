package com.pro.messaging_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pro.messaging_service.dto.ConversationRequest;
import com.pro.messaging_service.dto.MessageRequest;
import com.pro.messaging_service.dto.NotificationEvent;
import com.pro.messaging_service.entity.Conversation;
import com.pro.messaging_service.entity.Message;
import com.pro.messaging_service.producer.NotificationProducer;
import com.pro.messaging_service.repository.ConversationRepository;
import com.pro.messaging_service.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepo;
    private final MessageRepository messageRepo;
    private final NotificationProducer producer;

    // Create conversation
    public Conversation createConversation(ConversationRequest request) {
        Conversation convo = new Conversation();
        convo.setUser1Id(request.getUser1Id());
        convo.setUser2Id(request.getUser2Id());
        return conversationRepo.save(convo);
    }

    // Send message
    public Message sendMessage(MessageRequest request) {

        Message msg = new Message();
        msg.setConversationId(request.getConversationId());
        msg.setSenderId(request.getSenderId());
        msg.setContent(request.getContent());
        msg.setTimestamp(LocalDateTime.now());

        Message saved = messageRepo.save(msg);

        // 🔥 SEND KAFKA NOTIFICATION
        NotificationEvent event = new NotificationEvent();
        event.setEmail("renusreemalapati@gmail.com"); // TODO: dynamic later
        event.setMessage("New message: " + request.getContent());

        producer.sendNotification(event);

        return saved;
    }

    // Get chat history
    public List<Message> getMessages(Long conversationId) {
        return messageRepo.findByConversationIdOrderByTimestampAsc(conversationId);
    }
}