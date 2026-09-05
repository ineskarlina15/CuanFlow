package com.example.notification_service.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.notification_service.entity.Budget;
import com.example.notification_service.entity.FinancialGoal;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.NotificationType;
import com.example.notification_service.entity.SystemBroadcast;
import com.example.notification_service.repository.BudgetRepository;
import com.example.notification_service.repository.FinancialGoalRepository;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.repository.SystemBroadcastRepository;
import com.example.notification_service.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private FinancialGoalRepository financialGoalRepository;

    @Autowired
    private SystemBroadcastRepository systemBroadcastRepository;

    @Override
    public List<Notification> getMyNotifications(Integer userId, Boolean unreadOnly) {
        if (unreadOnly != null && unreadOnly) {
            return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markAsRead(Integer userId, Integer notificationId) throws Exception {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new Exception("Notifikasi tidak ditemukan"));

        if (!notif.getUserId().equals(userId)) {
            throw new Exception("Anda tidak memiliki akses ke notifikasi ini");
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Override
    public void markAllAsRead(Integer userId) {
        List<Notification> unreadNotifs = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unreadNotifs) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifs);
    }

    @Override
    public void deleteNotification(Integer userId, Integer notificationId) throws Exception {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new Exception("Notifikasi tidak ditemukan"));

        if (!notif.getUserId().equals(userId)) {
            throw new Exception("Anda tidak memiliki akses ke notifikasi ini");
        }

        notificationRepository.delete(notif);
    }

    // Cron job berjalan setiap hari jam 08:00 pagi
    @Scheduled(cron = "0 0 8 * * *")
    public void checkBudgetAndGoalAlerts() {
        System.out.println("Memulai pengecekan otomatis peringatan anggaran dan tujuan finansial...");

        // 1. Cek Peringatan Anggaran (Budget Alert)
        List<Budget> activeBudgets = budgetRepository.findAll();
        for (Budget b : activeBudgets) {
            BigDecimal spent = budgetRepository.calculateTotalSpent(b.getId(), b.getStartDate(), b.getEndDate());
            if (spent == null) spent = BigDecimal.ZERO;

            BigDecimal limit = b.getAmount();
            if (limit != null && limit.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = spent.divide(limit, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(100));
                BigDecimal threshold = new BigDecimal(b.getAlertPercentage() != null ? b.getAlertPercentage() : 80);

                if (ratio.compareTo(threshold) >= 0) {
                    String title = "Peringatan Anggaran: " + b.getName();
                    String message = String.format("Pengeluaran Anda untuk anggaran '%s' telah mencapai %.1f%% dari batas maksimum!", 
                            b.getName(), ratio.doubleValue());
                    
                    createNotificationIfNotExists(b.getUserId(), NotificationType.BUDGET_ALERT, title, message);
                }
            }
        }

        // 2. Cek Pengingat Target Finansial (Goal Reminder)
        List<FinancialGoal> activeGoals = financialGoalRepository.findAll();
        for (FinancialGoal g : activeGoals) {
            if (g.getTargetDate() != null) {
                long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), g.getTargetDate());
                if (daysRemaining <= 7 && daysRemaining >= 0) {
                    String title = "Pengingat Target: " + g.getName();
                    String message = String.format("Target finansial '%s' tinggal %d hari lagi menuju tenggat waktu. Segera penuhi target tabungan Anda!", 
                            g.getName(), daysRemaining);

                    createNotificationIfNotExists(g.getUserId(), NotificationType.GOAL_REMINDER, title, message);
                }
            }
        }
    }

    private void createNotificationIfNotExists(Integer userId, NotificationType type, String title, String message) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        boolean alreadyNotified = notificationRepository.existsByUserIdAndTypeAndTitleAndCreatedAtAfter(userId, type, title, startOfDay);

        if (!alreadyNotified) {
            Notification notif = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .build();
            notificationRepository.save(notif);
            System.out.println("Notifikasi terkirim ke User ID " + userId + ": " + title);
        }
    }

    @Override
    public SystemBroadcast createBroadcast(Integer senderId, String title, String message, String type, String targetAudience) {
        SystemBroadcast broadcast = SystemBroadcast.builder()
                .senderId(senderId != null ? senderId : 1)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .targetAudience(targetAudience != null ? targetAudience : "ALL_USERS")
                .recipientsCount(20)
                .isSent(true)
                .sentAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
        
        SystemBroadcast saved = systemBroadcastRepository.save(broadcast);

        // Sebarkan juga ke tabel notifikasi pengguna (user 1 sampai 20)
        NotificationType notifType = NotificationType.SYSTEM;
        if ("TIPS".equalsIgnoreCase(type)) {
            notifType = NotificationType.INFO;
        }

        for (int uId = 1; uId <= 20; uId++) {
            try {
                Notification notif = Notification.builder()
                        .userId(uId)
                        .title("[PENGUMUMAN] " + title)
                        .message(message)
                        .type(notifType)
                        .isRead(false)
                        .sentAt(LocalDateTime.now())
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notif);
            } catch (Exception ignored) {}
        }

        return saved;
    }

    @Override
    public List<SystemBroadcast> getAllBroadcasts() {
        return systemBroadcastRepository.findAllByOrderBySentAtDesc();
    }
}
