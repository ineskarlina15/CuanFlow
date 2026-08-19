package com.example.auth_service.payload.req;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileReq {
    private String name;
    private String phone;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String occupation;

} 
