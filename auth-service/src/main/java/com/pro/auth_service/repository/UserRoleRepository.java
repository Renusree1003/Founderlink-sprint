package com.pro.auth_service.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pro.auth_service.entity.UserRole;


public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findByUserId(Long userId);
}

