package com.example.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
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
    public ResponseEntity<?> register(@RequestBody RegisterReq request) {
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
    public ResponseEntity<?> login(@RequestBody LoginReq request) {
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
}
