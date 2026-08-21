package com.example.auth_service.utility;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Mengecek apakah header tidak null dan dimulai dengan "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Memotong kata "Bearer " untuk mengambil murni tokennya saja
            String token = authHeader.substring(7);
            if (jwtUtil.isValid(token)) {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                if (role != null) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                }

                // Membuat object User dari Spring Security
                // (Password dikosongkan karena kita hanya butuh verifikasi email dari token)
                User user = new User(
                        email,
                        "",
                        authorities);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities());

                auth.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                // Mendaftarkan user ke dalam konteks Spring Security bahwa dia sudah sah login
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

}
