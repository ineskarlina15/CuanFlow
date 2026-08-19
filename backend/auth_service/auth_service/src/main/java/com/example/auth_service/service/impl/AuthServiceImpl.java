package com.example.auth_service.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.auth_service.JwtUtil;
import com.example.auth_service.entity.Profile;
import com.example.auth_service.entity.User;
import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
import com.example.auth_service.payload.res.AuthRes;
import com.example.auth_service.repository.ProfileRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Inject PasswordEncoder (Bcrypt) dari SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String register(RegisterReq request) throws Exception {
        // 1. Validasi apakah email sudah terdaftar
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Pendaftaran gagal: Email sudah terdaftar!");
        }

        // 2. Enkripsi password menggunakan Bcrypt
        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Masukkan data ke entitas User
        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(encryptedPassword); // Simpan password yang sudah di-hash
        newUser.setPhone(request.getPhone());

        // 4. Simpan User ke database
        User savedUser = userRepository.save(newUser);

        // 5. Otomatis buatkan baris Profile kosong untuk user ini (Relasi 1:1)
        Profile newProfile = new Profile();
        newProfile.setUser(savedUser);
        profileRepository.save(newProfile);

        return "Registrasi berhasil! Silakan login menggunakan email Anda.";
    }

    @Override
    public AuthRes login(LoginReq request) throws Exception {
        // 1. Cari user di database berdasarkan email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new Exception("User tidak ditemukan!"));

        // 2. Verifikasi password menggunakan fitur matches() dari Bcrypt
        // (Parameter pertama: password asli dari user, Parameter kedua: password hash dari DB)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Password salah!");
        }

        // 3. Jika lolos, cetak Token JWT
        String token = jwtUtil.generateToken(user.getEmail());

        // 4. Susun data kembalian (Response)
        AuthRes response = new AuthRes();
        response.setToken(token);
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        return response;
    }
}
