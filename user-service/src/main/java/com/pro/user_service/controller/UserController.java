package com.pro.user_service.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.pro.user_service.entity.UserProfile;
import com.pro.user_service.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ CREATE PROFILE (any logged-in user)
    @PostMapping
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','COFOUNDER','ADMIN')")
    public UserProfile create(@RequestBody UserProfile user) {
        return userService.create(user);
    }

    // ✅ GET ALL USERS (ADMIN ONLY)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfile> getAll() {
        return userService.getAll();
    }

    // ✅ GET USER BY ID
    // 👉 User can see own profile OR admin
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #id.toString()")
    public UserProfile getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    // ✅ UPDATE USER
    // 👉 Only owner or admin
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #id.toString()")
    public UserProfile update(@PathVariable Long id, @RequestBody UserProfile user) {
        return userService.update(id, user);
    }
}