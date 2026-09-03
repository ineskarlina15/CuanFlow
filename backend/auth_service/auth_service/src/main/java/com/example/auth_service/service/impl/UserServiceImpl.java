package com.example.auth_service.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.auth_service.entity.Profile;
import com.example.auth_service.entity.User;
import com.example.auth_service.payload.req.UpdateProfileReq;
import com.example.auth_service.payload.res.ProfileRes;
import com.example.auth_service.repository.ProfileRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.service.UserService;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public ProfileRes getMyProfile(String username) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User tidak ditemukan"));
        
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new Exception("Profil tidak ditemukan"));

        return mapToProfileRes(user, profile);
    }

    @Override
    @Transactional
    public ProfileRes updateMyProfile(String username, UpdateProfileReq request) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User tidak ditemukan"));
        
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new Exception("Profil tidak ditemukan"));

        // Update data di tabel User jika ada perubahan
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        // Update Password jika newPassword diisi
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            String newPw = request.getNewPassword().trim();
            if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    throw new Exception("Password lama (Current Password) tidak sesuai!");
                }
            }
            user.setPassword(passwordEncoder.encode(newPw));
        }

        userRepository.save(user);

        // Update data di tabel Profile jika ada perubahan
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getOccupation() != null) profile.setOccupation(request.getOccupation());
        profileRepository.save(profile);

        return mapToProfileRes(user, profile);
    }

    @Override
    public List<ProfileRes> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() == null)
                .map(user -> {
                    Profile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
                        Profile p = new Profile();
                        p.setUser(user);
                        return p;
                    });
                    return mapToProfileRes(user, profile);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProfileRes updateUserRole(Integer targetUserId, String roleStr) throws Exception {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new Exception("Pengguna tidak ditemukan"));
        try {
            com.example.auth_service.entity.UserRole role = com.example.auth_service.entity.UserRole.valueOf(roleStr.toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new Exception("Role tidak valid. Gunakan ADMIN atau USER.");
        }
        userRepository.save(user);
        Profile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            Profile p = new Profile();
            p.setUser(user);
            return p;
        });
        return mapToProfileRes(user, profile);
    }

    @Override
    @Transactional
    public ProfileRes toggleUserStatus(Integer targetUserId) throws Exception {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new Exception("Pengguna tidak ditemukan"));
        boolean currentStatus = user.getIsActive() != null ? user.getIsActive() : true;
        user.setIsActive(!currentStatus);
        userRepository.save(user);

        Profile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            Profile p = new Profile();
            p.setUser(user);
            return p;
        });
        return mapToProfileRes(user, profile);
    }

    @Override
    @Transactional
    public void deleteUser(Integer targetUserId) throws Exception {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new Exception("Pengguna tidak ditemukan"));
        user.setDeletedAt(java.time.LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);
    }

    // Fungsi bantuan untuk memetakan Entity ke DTO
    private ProfileRes mapToProfileRes(User user, Profile profile) {
        ProfileRes response = new ProfileRes();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setIsActive(user.getIsActive() != null ? user.getIsActive() : true);
        response.setCreatedAt(user.getCreatedAt());
        response.setAvatarUrl(profile.getAvatarUrl());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setGender(profile.getGender());
        response.setAddress(profile.getAddress());
        response.setOccupation(profile.getOccupation());
        return response;
    }
}
