package com.example.auth_service.utility;

import java.security.Key;
import java.util.Date;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {
    @org.springframework.beans.factory.annotation.Value("${jwt.secret}")
    private String SECRET;
    
    // Set waktu token expire (Diubah ke 24 jam biar lega saat proses testing)
    private final long EXPIRATION = 1000 * 60 * 60 * 24; 

    private Key getKey() {
        return new SecretKeySpec(
                SECRET.getBytes(),
                SignatureAlgorithm.HS256.getJcaName()
        );
    }

    public String generateToken(Integer userId, String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey())
                .compact();
    }

    public String extractEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
                
        return claims.getSubject();
    }

    public Integer extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("userId", Integer.class);
    }

    public String extractRole(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
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

    public String generateResetToken(String email) {
        long RESET_EXPIRATION = 1000 * 60 * 15; // Berlaku 15 menit saja
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + RESET_EXPIRATION))
                .signWith(getKey())
                .compact();
    }
}
