package com.example.auth_service.payload.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterReq {
    private String name;
    private String email;
    private String password;
    private String phone;
}
