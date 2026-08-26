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

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

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
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
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
                .map(user -> profileRepository.findByUserId(user.getId())
                        .map(profile -> mapToProfileRes(user, profile))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
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
        response.setAvatarUrl(profile.getAvatarUrl());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setGender(profile.getGender());
        response.setAddress(profile.getAddress());
        response.setOccupation(profile.getOccupation());
        return response;
    }
}
