package com.example.notification_service.service;

import java.util.List;

import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.SystemBroadcast;

public interface NotificationService {
    List<Notification> getMyNotifications(Integer userId, Boolean unreadOnly);
    void markAsRead(Integer userId, Integer notificationId) throws Exception;
    void markAllAsRead(Integer userId);
    void deleteNotification(Integer userId, Integer notificationId) throws Exception;
    SystemBroadcast createBroadcast(Integer senderId, String title, String message, String type, String targetAudience);
    List<com.example.notification_service.entity.SystemBroadcast> getAllBroadcasts();
}
