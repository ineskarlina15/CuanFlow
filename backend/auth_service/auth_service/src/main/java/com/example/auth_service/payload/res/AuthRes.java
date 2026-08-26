package com.example.auth_service.payload.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRes {
    private Integer userId;
    private String token;
    private String name;
    private String username;
    private String email;
    private String role;
}
