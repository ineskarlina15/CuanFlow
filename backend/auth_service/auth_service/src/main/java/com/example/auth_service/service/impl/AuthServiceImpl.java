package com.example.auth_service.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.auth_service.utility.JwtUtil;
import com.example.auth_service.entity.Profile;
import com.example.auth_service.entity.User;
import com.example.auth_service.payload.req.ForgotPasswordReq;
import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
import com.example.auth_service.payload.req.ResetPasswordReq;
import com.example.auth_service.payload.res.AuthRes;
import com.example.auth_service.repository.ProfileRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String register(RegisterReq request) throws Exception {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Pendaftaran gagal: Username sudah terdaftar!");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Pendaftaran gagal: Email sudah terdaftar!");
            }
        }

        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(encryptedPassword);
        newUser.setPhone(request.getPhone());

        User savedUser = userRepository.save(newUser);

        Profile newProfile = new Profile();
        newProfile.setUser(savedUser);
        profileRepository.save(newProfile);

        return "Registrasi berhasil! Silakan login menggunakan email Anda.";
    }

    @Override
    public AuthRes login(LoginReq request) throws Exception {
        String identifier = request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getEmail();
        }
        if (identifier == null || identifier.isBlank()) {
            throw new Exception("Username atau Email tidak boleh kosong!");
        }

        final String searchId = identifier;
        User user = userRepository.findByUsername(searchId)
                .or(() -> userRepository.findByEmail(searchId))
                .orElseThrow(() -> new Exception("Username atau Email tidak ditemukan!"));

        if (!Boolean.TRUE.equals(user.getIsActive()) || user.getDeletedAt() != null) {
            throw new Exception("Akun tidak aktif atau sudah dihapus!");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Password salah!");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        AuthRes response = new AuthRes();
        response.setUserId(user.getId());
        response.setToken(token);
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            response.setAvatarUrl(profile.getAvatarUrl());
        });

        return response;
    }

    @Override
    public String forgotPassword(ForgotPasswordReq request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new Exception("Email tidak terdaftar!"));

        String resetToken = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return resetToken;
    }

    @Override
    public String resetPassword(ResetPasswordReq request) throws Exception {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new Exception("Token tidak valid atau salah!"));

        if (user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new Exception("Token sudah kedaluwarsa!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return "Password berhasil diubah! Silakan login menggunakan password baru Anda.";
    }
}
