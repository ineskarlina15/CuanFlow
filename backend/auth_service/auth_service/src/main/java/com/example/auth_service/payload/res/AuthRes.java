package com.example.auth_service.payload.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRes {
    private String token;
    private String name;
    private String email;
    private String role;
}
