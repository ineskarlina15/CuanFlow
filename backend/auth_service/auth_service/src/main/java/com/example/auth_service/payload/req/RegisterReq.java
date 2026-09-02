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
    @Size(min = 3, max = 50, message = "Nama harus antara 3 hingga 50 karakter")
    private String name;

    @NotBlank(message = "Username tidak boleh kosong")
    @Size(min = 4, max = 20, message = "Username harus antara 4 hingga 20 karakter")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username hanya boleh mengandung huruf dan angka")
    private String username;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    @Size(max = 50, message = "Email maksimal 50 karakter")
    private String email;

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 6, max = 30, message = "Password harus antara 6 hingga 30 karakter")
    private String password;

    @NotBlank(message = "Nomor HP tidak boleh kosong")
    @Pattern(regexp = "^(08|62)[0-9]{8,13}$", message = "Nomor HP tidak valid. Harus diawali 08 atau 62, dan terdiri dari 10-15 digit")
    private String phone;
}
