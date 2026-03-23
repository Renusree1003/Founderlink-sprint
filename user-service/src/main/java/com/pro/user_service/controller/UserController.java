package com.pro.user_service.controller;



import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.pro.user_service.entity.UserProfile;
import com.pro.user_service.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserProfile create(@RequestBody UserProfile user) {
        return userService.create(user);
    }

    @GetMapping
    public List<UserProfile> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public UserProfile getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PutMapping("/{id}")
    public UserProfile update(@PathVariable Long id, @RequestBody UserProfile user) {
        return userService.update(id, user);
    }
}
