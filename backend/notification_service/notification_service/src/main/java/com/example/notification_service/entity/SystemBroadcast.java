package com.example.notification_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "system_broadcasts")
public class SystemBroadcast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 30)
    private String type; // INFO, MAINTENANCE, TIPS

    @Column(name = "target_audience", nullable = false, length = 50)
    private String targetAudience; // ALL_USERS, ACTIVE_ONLY

    @Column(name = "recipients_count", nullable = false)
    private Integer recipientsCount;

    @Column(name = "is_sent", nullable = false)
    private Boolean isSent;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
        if (this.isSent == null) {
            this.isSent = true;
        }
        if (this.recipientsCount == null) {
            this.recipientsCount = 0;
        }
    }
}
