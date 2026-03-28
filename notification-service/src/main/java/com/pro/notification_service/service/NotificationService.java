package com.pro.notification_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    @Value("${spring.mail.username:}")
    private String mailUsername;
    @Value("${spring.mail.password:}")
    private String mailPassword;

    public boolean sendEmail(String to, String message) {
        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
            log.warn("Skipping email for {} because SMTP credentials are not configured", to);
            return false;
        }

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(mailUsername);
        mail.setTo(to);
        mail.setSubject("FounderLink Notification");
        mail.setText(message);

        try {
            mailSender.send(mail);
            log.info("Email sent to {}", to);
            return true;
        } catch (MailException ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            return false;
        }
    }
}
