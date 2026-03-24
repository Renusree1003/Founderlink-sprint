package com.pro.notification_service.consumer;


import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.pro.notification_service.dto.NotificationEvent;
import com.pro.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService service;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(NotificationEvent event) {

        System.out.println("Received event: " + event);

        service.sendEmail(event.getEmail(), event.getMessage());
    }
}