package com.example.auth_service.payload.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Pattern;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterReq {
    @NotBlank(message = "Nama tidak boleh kosong")
    private String name;

    @NotBlank(message = "Username tidak boleh kosong")
    @Size(min = 4, max = 20, message = "Username harus antara 4 hingga 20 karakter")
    private String username;

    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, max = 20, message = "Password harus antara 8 hingga 20 karakter")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$", message = "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol khusus")
    private String password;

    private String phone;
}
