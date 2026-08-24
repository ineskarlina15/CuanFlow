package com.example.auth_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.auth_service.utility.JwtFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Diaktifkan agar nanti bisa pakai @PreAuthorize di Controller
public class SecurityConfig {
    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Biar gampang testing di Postman
            .authorizeHttpRequests(auth -> auth
                // Izinkan API login dan register untuk di-hit tanpa authentication
                .requestMatchers(
                    "/api/v1/auth/login", 
                    "/api/v1/auth/register",
                    "/api/v1/auth/forgot-password",
                    "/api/v1/auth/reset-password"
                ).permitAll() 
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                // == STATELESS START ==
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Agar stateless
            )
            // Tambahkan bagian ini untuk handle authentication yg stateless
            .addFilterBefore(
                jwtFilter, 
                UsernamePasswordAuthenticationFilter.class
            )
            // == STATELESS END ==
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");

                    // Ini pesan gagal jika user belum melakukan authentication
                    response.getWriter().write(
                        "{" +
                        "\"message\": \"Silakan login terlebih dahulu untuk mengakses resource ini.\"," +
                        "\"status\": 401" +
                        "}"
                    ); 
                })
            );

        return http.build();
    }

}
