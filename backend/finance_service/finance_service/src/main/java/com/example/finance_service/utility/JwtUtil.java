package com.example.finance_service.utility;

import java.security.Key;
import java.nio.charset.StandardCharsets;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {
    private static final String PASSWORD_RESET_TOKEN = "PASSWORD_RESET";
    private static final String ACCESS_TOKEN = "ACCESS";

    @Value("${jwt.secret}")
    private String secret;

    private Key getKey() {
        return new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                SignatureAlgorithm.HS256.getJcaName()
        );
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) getKey())
                    .build()
                    .parseSignedClaims(token);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        return ACCESS_TOKEN.equals(extractClaims(token).get("tokenType", String.class));
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public Integer extractUserId(String token) {
        return extractClaims(token).get("userId", Integer.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
