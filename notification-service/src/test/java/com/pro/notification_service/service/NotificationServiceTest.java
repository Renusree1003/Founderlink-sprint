package com.pro.notification_service.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "mailUsername", "noreply@founderlink.test");
        ReflectionTestUtils.setField(service, "mailPassword", "dummy-password");
    }

    @Test
    void testSendEmail_success() {
        boolean sent = service.sendEmail("test@gmail.com", "Hello");

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        assertTrue(sent);
    }

    @Test
    void testSendEmail_failure() {
        doThrow(new MailSendException("Mail error"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        boolean sent = service.sendEmail("test@gmail.com", "Hello");
        assertFalse(sent);
    }
}
