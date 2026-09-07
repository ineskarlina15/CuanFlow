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

    @Autowired
    private Message message;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterReq request) {
        try {
            String result = authService.register(request);
              
            return message.success(result, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginReq request) {
        try {
            AuthRes data = authService.login(request);
            
            return message.getData("Login Success", data, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 401);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordReq request) {
        try {
            String token = authService.forgotPassword(request);
            return message.getData("Token reset password berhasil dibuat", token, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordReq request) {
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
            return message.success("Logout berhasil! Token telah dihapus dari sisi klien.", 200);
        } catch (Exception e) {
            return message.error("Gagal melakukan logout", 500);
        }
    }
}
