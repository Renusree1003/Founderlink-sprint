package com.pro.messaging_service.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ BYPASS Swagger & public endpoints
        if (path.contains("/swagger-ui") ||
            path.contains("/v3/api-docs") ||
            path.contains("/webjars")) {

            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);
            System.out.println("✅ TOKEN: " + token);

            try {
                Claims claims = jwtUtil.extractClaims(token);

                String username = claims.getSubject();

                // ✅ SAFE ROLE EXTRACTION (FIXED)
                Object rolesObj = claims.get("roles");

                List<String> roles;

                if (rolesObj instanceof List<?>) {
                    roles = ((List<?>) rolesObj).stream()
                            .map(Object::toString)
                            .map(String::trim)
                            .toList();
                } else if (rolesObj instanceof String) {
                    roles = List.of((String) rolesObj);
                } else {
                    roles = List.of();
                }

                System.out.println("✅ ROLES: " + roles);

                // ✅ CONVERT TO AUTHORITIES
                List<SimpleGrantedAuthority> authorities =
                        roles.stream()
                             .map(SimpleGrantedAuthority::new)
                             .toList();

                // ✅ SET AUTH ONLY IF NOT ALREADY SET
                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("✅ AUTH SET: " + authentication);
                }

            } catch (Exception e) {
                System.out.println("❌ JWT ERROR: " + e.getMessage());

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or Expired Token");
                return;
            }
        } else {
            System.out.println("❌ No Authorization Header");
        }

        filterChain.doFilter(request, response);
    }
}