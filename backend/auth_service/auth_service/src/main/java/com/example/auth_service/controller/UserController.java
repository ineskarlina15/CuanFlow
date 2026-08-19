package com.example.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.payload.req.UpdateProfileReq;
import com.example.auth_service.payload.res.ProfileRes;
import com.example.auth_service.service.UserService;
import com.example.auth_service.utility.Message;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private Message message;

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        try {
            // auth.getName() otomatis berisi email dari token JWT
            ProfileRes data = userService.getMyProfile(auth.getName());
            return message.getData("Berhasil mengambil data profil", data, 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(Authentication auth, @RequestBody UpdateProfileReq request) {
        try {
            ProfileRes data = userService.updateMyProfile(auth.getName(), request);
            return message.getData("Profil berhasil diperbarui", data, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
