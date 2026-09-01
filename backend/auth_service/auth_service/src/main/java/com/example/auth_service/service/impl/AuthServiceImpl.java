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

    // Inject PasswordEncoder (Bcrypt) dari SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String register(RegisterReq request) throws Exception {
        // 1. Validasi apakah username sudah terdaftar
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Pendaftaran gagal: Username sudah terdaftar!");
        }

        // Opsional: cek email jika email diisi
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Pendaftaran gagal: Email sudah terdaftar!");
            }
        }

        // 2. Enkripsi password menggunakan Bcrypt
        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Masukkan data ke entitas User
        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setUsername(request.getUsername());
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

        // 2. Verifikasi password menggunakan fitur matches() dari Bcrypt
        // (Parameter pertama: password asli dari user, Parameter kedua: password hash
        // dari DB)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Password salah!");
        }

        // 3. Jika lolos, cetak Token JWT
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        // 4. Susun data kembalian (Response)
        AuthRes response = new AuthRes();
        response.setUserId(user.getId());
        response.setToken(token);
        response.setName(user.getName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

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

        // CATATAN: Di dunia nyata, token ini dikirim via Email (JavaMailSender).
        // Karena kita belum setup SMTP Email untuk proyek ini, kita return saja
        // tokennya
        // sebagai response agar Frontend/Postman bisa langsung menggunakannya.
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
