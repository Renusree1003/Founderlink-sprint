package com.pro.auth_service.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.pro.auth_service.entity.Role;
import com.pro.auth_service.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleSeeder implements CommandLineRunner {

    private static final List<String> DEFAULT_ROLES = List.of(
            "ROLE_FOUNDER",
            "ROLE_INVESTOR",
            "ROLE_COFOUNDER",
            "ROLE_ADMIN");

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (String roleName : DEFAULT_ROLES) {
            roleRepository.findByNameIgnoreCase(roleName)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(roleName);
                        Role saved = roleRepository.save(role);
                        log.info("Seeded role {}", roleName);
                        return saved;
                    });
        }
    }
}
