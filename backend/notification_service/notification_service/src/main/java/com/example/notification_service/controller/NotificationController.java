package com.example.notification_service.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.notification_service.entity.SystemBroadcast;
import com.example.notification_service.service.NotificationService;
import com.example.notification_service.utility.Message;

@RestController
@RequestMapping("/api/v1/notifications")
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private Message message;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(required = false) Boolean unreadOnly) {
        try {
            return message.getData("Berhasil mengambil notifikasi", 
                    notificationService.getMyNotifications(userId, unreadOnly), 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            notificationService.markAsRead(userId, id);
            return message.success("Notifikasi ditandai sudah dibaca", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> patchMarkAsRead(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            notificationService.markAsRead(userId, id);
            return message.success("Notifikasi ditandai sudah dibaca (PATCH)", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestAttribute("userId") Integer userId) {
        try {
            notificationService.markAllAsRead(userId);
            return message.success("Semua notifikasi ditandai sudah dibaca", 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            notificationService.deleteNotification(userId, id);
            return message.success("Notifikasi berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping("/broadcast")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getBroadcastHistory() {
        try {
            return message.getData("Berhasil mengambil riwayat siaran pengumuman", 
                    notificationService.getAllBroadcasts(), 200);
        } catch (Exception e) {
            return message.error(e.getMessage(), 500);
        }
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createBroadcast(
            @RequestAttribute(value = "userId", required = false) Integer userId,
            @RequestBody Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String msg = payload.get("message");
            String type = payload.get("type");
            String audience = payload.get("targetAudience");

            if (title == null || title.isBlank() || msg == null || msg.isBlank()) {
                return message.badReq("Judul dan pesan pengumuman wajib diisi", 400);
            }

            SystemBroadcast result = notificationService.createBroadcast(userId, title, msg, type, audience);

            return message.getData("Siaran pengumuman berhasil disebarkan ke seluruh pengguna", result, 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
