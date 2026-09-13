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

    @Autowired
    private com.example.auth_service.service.AuditLogService auditLogService;

    @Autowired(required = false)
    private jakarta.servlet.http.HttpServletRequest httpRequest;

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

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) user.setPhone(request.getPhone());

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
        
        if (targetUserId == 1 || (user.getEmail() != null && user.getEmail().equalsIgnoreCase("admin@cuanflow.com"))) {
            if (!"ADMIN".equalsIgnoreCase(roleStr)) {
                throw new Exception("Akun Master System Administrator (Super Admin) dilindungi dan tidak dapat diubah menjadi USER!");
            }
        }

        try {
            com.example.auth_service.entity.UserRole role = com.example.auth_service.entity.UserRole.valueOf(roleStr.toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new Exception("Role tidak valid. Gunakan ADMIN atau USER.");
        }
        userRepository.save(user);

        // Catat otomatis ke Log Audit Sistem (Audit Trail)
        try {
            String userName = user.getName() != null ? user.getName() : user.getUsername();
            String entityInfo = "User ID #" + user.getId() + " (" + userName + ")";
            String desc = "Mengubah peran pengguna '" + userName + "' (" + user.getEmail() + ") menjadi " + user.getRole().name();
            auditLogService.recordLog(
                    getAdminActorId(),
                    "UPDATE_ROLE",
                    "USER_MANAGEMENT",
                    entityInfo,
                    desc,
                    getClientIp(),
                    getClientUserAgent(),
                    "SUCCESS",
                    "HIGH"
            );
        } catch (Exception e) {
            System.err.println("Audit log error on updateUserRole: " + e.getMessage());
        }

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

        if (targetUserId == 1 || (user.getEmail() != null && user.getEmail().equalsIgnoreCase("admin@cuanflow.com"))) {
            throw new Exception("Akun Master System Administrator (Super Admin) dilindungi dan harus selalu berstatus Aktif!");
        }

        boolean currentStatus = user.getIsActive() != null ? user.getIsActive() : true;
        user.setIsActive(!currentStatus);
        userRepository.save(user);

        // Catat otomatis ke Log Audit Sistem (Audit Trail)
        try {
            String userName = user.getName() != null ? user.getName() : user.getUsername();
            String entityInfo = "User ID #" + user.getId() + " (" + userName + ")";
            String actionName = !currentStatus ? "ACTIVATE_ACCOUNT" : "SUSPEND_ACCOUNT";
            String statusText = !currentStatus ? "mengaktifkan kembali" : "menonaktifkan (suspend)";
            String desc = "Administrator sistem " + statusText + " status akun pengguna '" + userName + "'";
            String severity = !currentStatus ? "MEDIUM" : "HIGH";
            auditLogService.recordLog(
                    getAdminActorId(),
                    actionName,
                    "SECURITY_CONTROL",
                    entityInfo,
                    desc,
                    getClientIp(),
                    getClientUserAgent(),
                    "SUCCESS",
                    severity
            );
        } catch (Exception e) {
            System.err.println("Audit log error on toggleUserStatus: " + e.getMessage());
        }

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

        // Proteksi Akun Master System Administrator
        if (targetUserId == 1 || (user.getEmail() != null && user.getEmail().equalsIgnoreCase("admin@cuanflow.com"))) {
            throw new Exception("Akun Master System Administrator (Super Admin) dilindungi dan tidak dapat dihapus dari sistem!");
        }

        user.setDeletedAt(java.time.LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);

        // Catat otomatis ke Log Audit Sistem (Audit Trail)
        try {
            String userName = user.getName() != null ? user.getName() : user.getUsername();
            String entityInfo = "User ID #" + user.getId() + " (" + userName + ")";
            String desc = "Administrator sistem menghapus akun pengguna '" + userName + "' (" + user.getEmail() + ") secara aman (Soft Delete)";
            auditLogService.recordLog(
                    getAdminActorId(),
                    "DELETE_USER",
                    "USER_MANAGEMENT",
                    entityInfo,
                    desc,
                    getClientIp(),
                    getClientUserAgent(),
                    "SUCCESS",
                    "HIGH"
            );
        } catch (Exception e) {
            System.err.println("Audit log error on deleteUser: " + e.getMessage());
        }
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

    private Integer getAdminActorId() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                var adminUser = userRepository.findByUsername(auth.getName()).orElse(null);
                if (adminUser != null) {
                    return adminUser.getId();
                }
            }
        } catch (Exception ignored) {}
        return 1;
    }

    private String getClientIp() {
        try {
            if (httpRequest != null) {
                String ip = httpRequest.getHeader("X-Forwarded-For");
                if (ip != null && !ip.isBlank()) {
                    return ip.split(",")[0].trim();
                }
                return httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    private String getClientUserAgent() {
        try {
            if (httpRequest != null) {
                String ua = httpRequest.getHeader("User-Agent");
                if (ua != null && !ua.isBlank()) {
                    return ua;
                }
            }
        } catch (Exception ignored) {}
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CuanFlow Web Admin";
    }
}
