package com.pro.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.pro.api_gateway.util.JwtUtil;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<Object> {

    public JwtAuthenticationFilter() {
        super(Object.class);
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {

            String path = exchange.getRequest().getURI().getPath();

            // ✅ PUBLIC ENDPOINTS (NO JWT REQUIRED)
            if (path.startsWith("/auth-service/auth") ||
                path.contains("/swagger-ui") ||
                path.contains("/v3/api-docs")) {

                return chain.filter(exchange);
            }

            // 🔐 GET HEADER
            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst("Authorization");

            // ❌ NO HEADER
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);

            try {
                // ✅ VALIDATE TOKEN
                JwtUtil.validateToken(token);

                // 🔥 DEBUG LOG (optional)
                System.out.println("JWT VALIDATED SUCCESSFULLY");

            } catch (Exception e) {
                System.out.println("JWT INVALID: " + e.getMessage());

                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }
}