package com.example.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC, n.id DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.isRead = :isRead ORDER BY n.createdAt DESC, n.id DESC")
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(@Param("userId") Integer userId, @Param("isRead") Boolean isRead);
    boolean existsByUserIdAndTypeAndTitleAndCreatedAtAfter(Integer userId, NotificationType type, String title, java.time.LocalDateTime date);

    @Query(value = "SELECT CAST(id AS INTEGER) FROM users ORDER BY id ASC", nativeQuery = true)
    List<Object> findAllUserIds();
}
