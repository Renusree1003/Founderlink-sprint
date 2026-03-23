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

    // ✅ CREATE PROFILE
    @PostMapping
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','ADMIN')")
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
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','ADMIN')")
    public UserProfile getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    // ✅ UPDATE USER
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','ADMIN')")
    public UserProfile update(@PathVariable Long id, @RequestBody UserProfile user) {
        return userService.update(id, user);
    }
}