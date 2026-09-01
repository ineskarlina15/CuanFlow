package com.example.auth_service.service.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.auth_service.entity.User;
import com.example.auth_service.payload.req.LoginReq;
import com.example.auth_service.payload.req.ResetPasswordReq;
import com.example.auth_service.repository.ProfileRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.utility.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1)
                .username("ineskarlina")
                .password("hashed-password")
                .isActive(true)
                .build();
    }

    @Test
    void loginRejectsInactiveUser() {
        user.setIsActive(false);
        when(userRepository.findByUsername("ineskarlina")).thenReturn(Optional.of(user));

        LoginReq request = new LoginReq("ineskarlina", "Password1!");

        assertThrows(Exception.class, () -> authService.login(request));
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }

    @Test
    void resetPasswordRejectsAccessToken() {
        ResetPasswordReq request = new ResetPasswordReq("access-token", "NewPassword1!");
        when(userRepository.findByResetPasswordToken("access-token")).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> authService.resetPassword(request));
        verify(userRepository, never()).save(any());
    }
}
