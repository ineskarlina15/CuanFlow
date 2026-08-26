package com.example.auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.auth_service.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
    // Fungsi ini akan otomatis menjadi query: SELECT * FROM users WHERE email = ?. untuk mencari user saat Login
    Optional<User> findByEmail(String email);

    // Fungsi ini mengecek apakah email sudah dipakai (return true/false), untuk mencegah duplikasi email saat Register
    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
}
