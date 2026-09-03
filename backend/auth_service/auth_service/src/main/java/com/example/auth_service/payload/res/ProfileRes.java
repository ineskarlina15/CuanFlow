package com.example.auth_service.payload.res;

import lombok.NoArgsConstructor;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRes {
    private Integer userId;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String occupation;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
}
