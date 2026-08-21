package com.example.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.notification_service.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Integer userId, Boolean isRead);
    boolean existsByUserIdAndTypeAndTitleAndCreatedAtAfter(Integer userId, com.example.notification_service.entity.NotificationType type, String title, java.time.LocalDateTime date);
}
