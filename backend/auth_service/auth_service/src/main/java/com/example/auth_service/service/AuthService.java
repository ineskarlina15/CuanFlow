package com.example.auth_service.service;

import org.springframework.stereotype.Service;

import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
import com.example.auth_service.payload.res.AuthRes;

@Service
public interface AuthService {
    // Fungsi untuk mendaftarkan user baru
    public String register(RegisterReq request) throws Exception;
    
    // Fungsi untuk login dan mengembalikan token
    public AuthRes login(LoginReq request) throws Exception;
}
