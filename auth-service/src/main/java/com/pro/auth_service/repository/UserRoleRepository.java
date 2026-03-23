package com.pro.auth_service.repository;





import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pro.auth_service.entity.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    @Query(value = """
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = :userId
    """, nativeQuery = true)
    List<String> findRolesByUserId(Long userId);
}
