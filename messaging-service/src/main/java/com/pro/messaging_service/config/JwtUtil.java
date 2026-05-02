package com.pro.messaging_service.config;

import java.nio.charset.StandardCharsets;
import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

    private static final int MIN_SECRET_LENGTH = 32;

    private final String secret;

    public JwtUtil(@Value("${security.jwt.secret:change-this-jwt-key-before-production-12345}") String secret) {
        this.secret = secret;
    }

    @PostConstruct
    void validateSecret() {
        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException("security.jwt.secret must be at least 32 characters long");
        }
    }

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
