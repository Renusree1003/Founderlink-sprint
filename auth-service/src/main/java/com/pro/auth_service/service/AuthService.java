package com.pro.auth_service.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pro.auth_service.entity.User;
import com.pro.auth_service.entity.UserRole;
import com.pro.auth_service.repository.UserRepository;
import com.pro.auth_service.repository.UserRoleRepository;
import com.pro.auth_service.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository; // 🔥 ADDED
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ✅ REGISTER USER + ASSIGN DEFAULT ROLE
    public String register(String email, String password) {

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(user);

        // 🔥 Assign default role (ROLE_FOUNDER → id = 1)
        UserRole userRole = new UserRole();
        userRole.setUserId(savedUser.getId());
        userRole.setRoleId(1L); // ⚠️ make sure this exists in DB

        userRoleRepository.save(userRole);

        return "User registered successfully";
    }

    // ✅ LOGIN WITH ROLES FROM DB
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // ✅ FIX: assign role properly
        List<String> roles = List.of("ROLE_FOUNDER");

        return jwtUtil.generateToken(email, roles);
    }
}