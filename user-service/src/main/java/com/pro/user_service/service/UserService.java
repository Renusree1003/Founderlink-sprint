package com.pro.user_service.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.pro.user_service.dto.UserRequest;
import com.pro.user_service.dto.UserSummaryResponse;
import com.pro.user_service.entity.UserProfile;
import com.pro.user_service.repository.UserRepository;

@Service
public class UserService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @CachePut(value = "users", key = "#result.id")
    public UserProfile create(UserRequest request) {
        validateEmailUniqueness(request.getEmail(), null);
        validateUsernameUniqueness(request.getUsername(), null);

        UserProfile user = new UserProfile();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setBio(request.getBio());

        UserProfile savedUser = userRepository.save(user);
        log.info("Created user profile with id={}", savedUser.getId());
        return savedUser;
    }

    public List<UserProfile> getAll() {
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#id")
    public UserProfile getById(Long id) {
        log.debug("Fetching user profile with id={}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User profile not found for id " + id));
    }

    @CachePut(value = "users", key = "#id")
    public UserProfile update(Long id, UserRequest request) {
        UserProfile existing;
        try {
            existing = getById(id);
        } catch (NoSuchElementException e) {
            existing = new UserProfile();
            existing.setId(id);
        }
        
        validateEmailUniqueness(request.getEmail(), existing.getId() != null ? existing.getId() : id);
        validateUsernameUniqueness(request.getUsername(), existing.getId() != null ? existing.getId() : id);
        
        existing.setUsername(request.getUsername());
        existing.setFullName(request.getFullName());
        existing.setName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setBio(request.getBio());

        UserProfile updatedUser = userRepository.save(existing);
        log.info("Updated/Created user profile with id={}", updatedUser.getId());
        return updatedUser;
    }

    public UserSummaryResponse getSummaryById(Long id) {
        UserProfile profile = getById(id);
        return new UserSummaryResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getFullName(),
                profile.getName(),
                profile.getEmail(),
                profile.getBio());
    }

    public UserSummaryResponse getSummaryByUsername(String username) {
        UserProfile profile = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NoSuchElementException("User profile not found for username " + username));
        return new UserSummaryResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getFullName(),
                profile.getName(),
                profile.getEmail(),
                profile.getBio());
    }

    private void validateEmailUniqueness(String email, Long currentUserId) {
        boolean emailExists = userRepository.existsByEmailIgnoreCase(email);
        if (!emailExists) {
            return;
        }

        if (currentUserId != null) {
            UserProfile currentUser = getById(currentUserId);
            if (currentUser.getEmail().equalsIgnoreCase(email)) {
                return;
            }
        }

        throw new IllegalArgumentException("Email already exists: " + email);
    }

    private void validateUsernameUniqueness(String username, Long currentUserId) {
        boolean usernameExists = userRepository.existsByUsernameIgnoreCase(username);
        if (!usernameExists) {
            return;
        }

        if (currentUserId != null) {
            UserProfile currentUser = getById(currentUserId);
            if (currentUser.getUsername() != null && currentUser.getUsername().equalsIgnoreCase(username)) {
                return;
            }
        }

        throw new IllegalArgumentException("Username already exists: " + username);
    }
}
