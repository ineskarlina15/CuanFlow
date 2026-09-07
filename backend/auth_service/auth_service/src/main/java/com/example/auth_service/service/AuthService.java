package com.example.auth_service.service;

import org.springframework.stereotype.Service;

import com.example.auth_service.payload.req.ForgotPasswordReq;
import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.RegisterReq;
import com.example.auth_service.payload.req.ResetPasswordReq;
import com.example.auth_service.payload.res.AuthRes;

@Service
public interface AuthService {
    public String register(RegisterReq request) throws Exception;
    public AuthRes login(LoginReq request) throws Exception;
    String forgotPassword(ForgotPasswordReq request) throws Exception;
    String resetPassword(ResetPasswordReq request) throws Exception;
}
