package com.pro.api_gateway.util;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

public class JwtUtil {

    private static final String SECRET = "mysecretkeymysecretkeymysecretkey123";

    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    public static Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
