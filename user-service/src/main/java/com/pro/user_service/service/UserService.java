package com.pro.user_service.service;



import java.util.List;

import org.springframework.stereotype.Service;

import com.pro.user_service.entity.UserProfile;
import com.pro.user_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfile create(UserProfile user) {
        return userRepository.save(user);
    }

    public List<UserProfile> getAll() {
        return userRepository.findAll();
    }

    public UserProfile getById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    public UserProfile update(Long id, UserProfile user) {
        UserProfile existing = getById(id);
        existing.setName(user.getName());
        existing.setEmail(user.getEmail());
        existing.setBio(user.getBio());
        return userRepository.save(existing);
    }
}
