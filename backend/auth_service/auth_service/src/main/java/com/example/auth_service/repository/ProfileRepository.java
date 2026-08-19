package com.example.auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.auth_service.entity.Profile;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer>{
    // Fungsi ini akan otomatis menjadi query: SELECT * FROM profiles WHERE user_id = ?
    Optional<Profile> findByUserId(Integer userId);
}
