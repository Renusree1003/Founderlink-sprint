package com.pro.notification_service.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.pro.notification_service.config.RabbitConfig;
import com.pro.notification_service.dto.NotificationEvent;
import com.pro.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService service;

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void consume(NotificationEvent event) {
        log.info("Received notification event for email={}", event.getEmail());
        boolean sent = service.sendEmail(event.getEmail(), event.getMessage());
        if (sent) {
            log.info("Notification event processed successfully for email={}", event.getEmail());
        } else {
            log.warn("Notification event consumed but email was not sent for email={}", event.getEmail());
        }
    }
}
