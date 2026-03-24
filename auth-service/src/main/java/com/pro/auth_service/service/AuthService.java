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
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ✅ REGISTER USER + DEFAULT ROLE
    public String register(String email, String password) {

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(user);

        // 🔥 Assign default role (FOUNDER)
        UserRole userRole = new UserRole();
        userRole.setUserId(savedUser.getId());
        userRole.setRoleId(1L); // ROLE_FOUNDER

        userRoleRepository.save(userRole);

        return "User registered successfully";
    }

    // ✅ LOGIN USER
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 🔥 FETCH ROLES FROM DB (THIS IS THE FIX)
        List<String> roles = userRoleRepository.findRolesByUserId(user.getId());

        System.out.println("ROLES FROM DB: " + roles); // DEBUG

        // 🔥 GENERATE TOKEN WITH ROLES
        return jwtUtil.generateToken(String.valueOf(user.getId()), roles);
    }
}