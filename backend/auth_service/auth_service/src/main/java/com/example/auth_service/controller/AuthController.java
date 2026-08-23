package com.example.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.payload.req.ForgotPasswordReq;
import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
import com.example.auth_service.payload.req.ResetPasswordReq;
import com.example.auth_service.payload.res.AuthRes;
import com.example.auth_service.service.AuthService;
import com.example.auth_service.utility.Message;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    // Inject class Message untuk standardisasi response JSON
    @Autowired
    private Message message;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterReq request) {
        try {
            // Memanggil logika register di Service
            String result = authService.register(request);
              
            // Menggunakan method success() dari Message.java
            return message.success(result, 200);
        } catch (Exception e) {
            // Jika ada error (misal email sudah ada), gunakan badReq()
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginReq request) {
        try {
            // Memanggil logika login di Service
            AuthRes data = authService.login(request);
            
            // Menggunakan method getData() dari Message.java karena kita mereturn object AuthRes
            return message.getData("Login Success", data, 200);
        } catch (Exception e) {
            // Jika password salah atau user tidak ditemukan
            return message.badReq(e.getMessage(), 401);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordReq request) {
        try {
            String token = authService.forgotPassword(request);
            // Mengembalikan token reset (sementara) agar mudah di-copy di Postman
            return message.getData("Token reset password berhasil dibuat", token, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordReq request) {
        try {
            String result = authService.resetPassword(request);
            return message.success(result, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication auth) {
        try {
            // Karena kita menggunakan JWT stateless, kita hanya perlu mengembalikan pesan sukses ke frontend. Frontend yang bertugas menghapus tokennya.
            return message.success("Logout berhasil! Token telah dihapus dari sisi klien.", 200);
        } catch (Exception e) {
            return message.error("Gagal melakukan logout", 500);
        }
    }
}
