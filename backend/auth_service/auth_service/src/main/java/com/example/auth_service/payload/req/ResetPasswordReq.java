package com.example.auth_service.payload.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordReq {
    @NotBlank(message = "Token reset wajib diisi")
    private String token;

    @NotBlank(message = "Password baru wajib diisi")
    @Size(min = 8, max = 20, message = "Password harus antara 8 hingga 20 karakter")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$", message = "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol khusus")
    private String newPassword;
}
