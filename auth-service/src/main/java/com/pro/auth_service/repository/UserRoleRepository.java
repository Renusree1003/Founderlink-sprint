package com.pro.auth_service.repository;





import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.pro.auth_service.entity.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    Optional<UserRole> findByUserId(Long userId);

    @Query(value = """
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = :userId
    """, nativeQuery = true)
    List<String> findRolesByUserId(@Param("userId") Long userId);

    @Query(value = """
        SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE UPPER(r.name) = 'ROLE_ADMIN'
    """, nativeQuery = true)
    boolean existsAdminUser();
}
