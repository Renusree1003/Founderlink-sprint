package com.pro.auth_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pro.auth_service.entity.Role;
import com.pro.auth_service.entity.User;
import com.pro.auth_service.entity.UserRole;
import com.pro.auth_service.producer.NotificationProducer;
import com.pro.auth_service.repository.RoleRepository;
import com.pro.auth_service.repository.UserRepository;
import com.pro.auth_service.repository.UserRoleRepository;
import com.pro.auth_service.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private NotificationProducer notificationProducer;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegisterCreatesPendingUserAndSendsOtp() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encoded_pwd");
        when(userRoleRepository.findByUserId(1L)).thenReturn(Optional.empty());

        Role founderRole = new Role();
        founderRole.setId(1L);
        founderRole.setName("ROLE_FOUNDER");
        when(roleRepository.findByNameIgnoreCase("ROLE_FOUNDER")).thenReturn(Optional.of(founderRole));

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("test@test.com");
        savedUser.setPassword("encoded_pwd");
        savedUser.setOtpCode("123456");
        savedUser.setEnabled(false);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userRoleRepository.save(any(UserRole.class))).thenAnswer(i -> i.getArguments()[0]);

        String result = authService.register("test@test.com", "password", "FOUNDER");

        assertEquals("Registration successful. Please verify the OTP sent to your email.", result);
        verify(passwordEncoder, times(1)).encode("password");
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRoleRepository, times(1)).save(any(UserRole.class));
        verify(notificationProducer, times(1)).sendNotification(any());
    }

    @Test
    void testLoginSuccess() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setPassword("encoded_pwd");
        user.setEnabled(true);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded_pwd")).thenReturn(true);
        when(userRoleRepository.findRolesByUserId(1L)).thenReturn(Arrays.asList("ROLE_FOUNDER"));
        when(jwtUtil.generateToken("1", Arrays.asList("ROLE_FOUNDER"))).thenReturn("jwt_token");

        String token = authService.login("test@test.com", "password");

        assertEquals("jwt_token", token);
        verify(userRepository, times(1)).findByEmail("test@test.com");
        verify(passwordEncoder, times(1)).matches("password", "encoded_pwd");
        verify(userRoleRepository, times(1)).findRolesByUserId(1L);
        verify(jwtUtil, times(1)).generateToken("1", Arrays.asList("ROLE_FOUNDER"));
    }

    @Test
    void testLoginUserNotFound() {
        when(userRepository.findByEmail("notfound@test.com")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> authService.login("notfound@test.com", "password"));
        verify(userRepository, times(1)).findByEmail("notfound@test.com");
    }

    @Test
    void testLoginBlockedWhenEmailNotVerified() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded_pwd");
        user.setEnabled(false);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.login("test@test.com", "password"));
        assertEquals("Email is not verified. Please verify OTP before login.", ex.getMessage());
    }

    @Test
    void testLoginInvalidPassword() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded_pwd");
        user.setEnabled(true);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_pwd", "encoded_pwd")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login("test@test.com", "wrong_pwd"));
        verify(userRepository, times(1)).findByEmail("test@test.com");
        verify(passwordEncoder, times(1)).matches("wrong_pwd", "encoded_pwd");
    }
}
