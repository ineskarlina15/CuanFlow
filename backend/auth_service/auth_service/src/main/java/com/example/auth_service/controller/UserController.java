package com.example.auth_service.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

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
            ProfileRes data = userService.getMyProfile(auth.getName());
            return message.getData("Berhasil mengambil data profil", data, 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(Authentication auth, @Valid @RequestBody UpdateProfileReq payload) {
        try {
            ProfileRes data = userService.updateMyProfile(auth.getName(), payload);
            return message.getData("Profil berhasil diperbarui", data, 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            return message.getData("Berhasil mengambil daftar pengguna (Khusus Admin)", userService.getAllUsers(), 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        try {
            String role = payload.get("role");
            if (role == null || role.isBlank()) {
                return message.badReq("Role tidak boleh kosong", 400);
            }
            return message.getData("Peran pengguna berhasil diperbarui", userService.updateUserRole(id, role), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Integer id) {
        try {
            return message.getData("Status akun pengguna berhasil diperbarui (PATCH)", userService.toggleUserStatus(id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return message.success("Pengguna berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
