package com.example.auth_service.payload.req;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileReq {
    @Size(min = 3, max = 50, message = "Nama harus antara 3 hingga 50 karakter")
    private String name;

    @Pattern(regexp = "^(08|62)[0-9]{8,13}$", message = "Nomor HP tidak valid. Harus diawali 08 atau 62, dan terdiri dari 10-15 digit")
    private String phone;
    
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender;
    
    @Size(max = 200, message = "Alamat maksimal 200 karakter")
    private String address;
    
    @Size(max = 100, message = "Pekerjaan maksimal 100 karakter")
    private String occupation;
    
    private String currentPassword;
    
    @Size(min = 6, max = 30, message = "Password baru harus antara 6 hingga 30 karakter")
    private String newPassword;
}
