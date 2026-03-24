package com.pro.messaging_service.producer;



import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.pro.messaging_service.dto.NotificationEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    private static final String TOPIC = "notification-topic";

    public void sendNotification(NotificationEvent event) {
        kafkaTemplate.send(TOPIC, event);
        System.out.println("Sent event to Kafka: " + event);
    }
}