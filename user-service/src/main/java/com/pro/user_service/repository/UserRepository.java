package com.pro.user_service.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.pro.user_service.entity.UserProfile;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    Optional<UserProfile> findByUsernameIgnoreCase(String username);
}
