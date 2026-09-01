package com.example.auth_service.payload.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginReq {
    private String username;
    private String email;

    @NotBlank(message = "Password tidak boleh kosong")
    private String password;

    public LoginReq(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
