package com.pro.user_service.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pro.user_service.dto.UserRequest;
import com.pro.user_service.dto.UserSummaryResponse;
import com.pro.user_service.entity.UserProfile;
import com.pro.user_service.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','COFOUNDER','ADMIN')")
    public UserProfile create(@Valid @RequestBody UserRequest user) {
        return userService.create(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfile> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','COFOUNDER','ADMIN')")
    public UserProfile getById(@PathVariable(name = "id") Long id) {
        return userService.getById(id);
    }

    @GetMapping("/internal/{id}")
    public UserSummaryResponse getInternalById(@PathVariable(name = "id") Long id) {
        return userService.getSummaryById(id);
    }

    @GetMapping("/internal/username/{username}")
    public UserSummaryResponse getInternalByUsername(@PathVariable(name = "username") String username) {
        return userService.getSummaryByUsername(username);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #id.toString()")
    public UserProfile update(@PathVariable(name = "id") Long id, @Valid @RequestBody UserRequest user) {
        return userService.update(id, user);
    }
}
