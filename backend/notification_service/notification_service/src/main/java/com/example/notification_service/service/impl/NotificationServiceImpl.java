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

    @Autowired(required = false)
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public List<Notification> getMyNotifications(Integer userId, Boolean unreadOnly) {
        if (userId != null) {
            try {
                // Ambil tanggal pendaftaran user dari tabel users
                LocalDateTime userCreatedAt = null;
                if (jdbcTemplate != null) {
                    try {
                        java.sql.Timestamp ts = jdbcTemplate.queryForObject(
                                "SELECT created_at FROM users WHERE id = ?", java.sql.Timestamp.class, userId);
                        if (ts != null) {
                            userCreatedAt = ts.toLocalDateTime();
                        }
                    } catch (Exception ignored) {}
                }

                // 1. Sambut pengguna baru yang belum memiliki notifikasi sama sekali
                List<Notification> existingUserNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
                if (existingUserNotifs == null || existingUserNotifs.isEmpty()) {
                    LocalDateTime welcomeTime = userCreatedAt != null ? userCreatedAt : LocalDateTime.now();
                    Notification welcomeNotif = Notification.builder()
                            .userId(userId)
                            .title("Selamat Datang di CuanFlow!")
                            .message("Akun Anda telah aktif. Mulai catat transaksi pertama Anda, atur anggaran bulanan, dan pantau keuangan Anda sekarang!")
                            .type(NotificationType.SYSTEM)
                            .isRead(false)
                            .sentAt(welcomeTime)
                            .createdAt(welcomeTime)
                            .build();
                    try {
                        notificationRepository.save(welcomeNotif);
                    } catch (Exception ignored) {}
                }

                // 2. Bersihkan notifikasi siaran masa lalu yang tidak sengaja tersalin sebelum tanggal daftar user
                if (userCreatedAt != null && jdbcTemplate != null) {
                    try {
                        jdbcTemplate.update(
                                "DELETE FROM notifications WHERE user_id = ? AND title LIKE '[PENGUMUMAN]%' AND created_at < ?",
                                userId, java.sql.Timestamp.valueOf(userCreatedAt));
                    } catch (Exception ignored) {}
                }

                // 3. Sinkronisasikan pengumuman siaran sistem (broadcast) yang dikirim setelah atau pada tanggal pendaftaran user
                List<SystemBroadcast> broadcasts = systemBroadcastRepository.findAllByOrderBySentAtDesc();
                if (broadcasts != null && !broadcasts.isEmpty()) {
                    List<Notification> existingNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
                    for (SystemBroadcast sb : broadcasts) {
                        LocalDateTime timeToUse = sb.getSentAt() != null ? sb.getSentAt() : (sb.getCreatedAt() != null ? sb.getCreatedAt() : LocalDateTime.now());

                        // Pengguna baru TIDAK menerima pengumuman masa lalu yang dikirim sebelum tanggal pendaftaran akunnya
                        if (userCreatedAt != null && timeToUse.isBefore(userCreatedAt)) {
                            continue;
                        }

                        String cleanTitle = sb.getTitle() != null ? sb.getTitle().trim() : "";
                        String taggedTitle = "[PENGUMUMAN] " + cleanTitle;

                        boolean alreadyExists = existingNotifs != null && existingNotifs.stream().anyMatch(n -> {
                            if (n.getTitle() == null) return false;
                            String t = n.getTitle().trim();
                            return t.equalsIgnoreCase(taggedTitle) || t.equalsIgnoreCase(cleanTitle) || t.contains(cleanTitle);
                        });

                        if (!alreadyExists) {
                            NotificationType notifType = "TIPS".equalsIgnoreCase(sb.getType()) ? NotificationType.INFO : NotificationType.SYSTEM;
                            Notification notif = Notification.builder()
                                    .userId(userId)
                                    .title(taggedTitle)
                                    .message(sb.getMessage())
                                    .type(notifType)
                                    .isRead(false)
                                    .sentAt(timeToUse)
                                    .createdAt(timeToUse)
                                    .build();
                            try {
                                notificationRepository.save(notif);
                            } catch (Exception ex) {
                                System.err.println("Gagal simpan auto-sync notifikasi: " + ex.getMessage());
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Info: Gagal auto-sync notifikasi untuk userId " + userId + ": " + e.getMessage());
            }
        }

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

    private List<Integer> getAllTargetUserIds(String targetAudience) {
        List<Integer> userIds = new java.util.ArrayList<>();
        if (jdbcTemplate != null) {
            try {
                String sql = "SELECT id FROM users WHERE deleted_at IS NULL ORDER BY id ASC";
                if ("ACTIVE_ONLY".equalsIgnoreCase(targetAudience) || "Pengguna Aktif Saja".equalsIgnoreCase(targetAudience)) {
                    sql = "SELECT id FROM users WHERE is_active = true AND deleted_at IS NULL ORDER BY id ASC";
                }
                List<Integer> queryResult = jdbcTemplate.queryForList(sql, Integer.class);
                if (queryResult != null && !queryResult.isEmpty()) {
                    userIds.addAll(queryResult);
                }
            } catch (Exception e) {
                try {
                    List<Integer> fallbackResult = jdbcTemplate.queryForList("SELECT id FROM users ORDER BY id ASC", Integer.class);
                    if (fallbackResult != null && !fallbackResult.isEmpty()) {
                        userIds.addAll(fallbackResult);
                    }
                } catch (Exception ex) {
                    System.err.println("Gagal query users via JdbcTemplate: " + ex.getMessage());
                }
            }
        }

        // Fallback jika query kosong
        if (userIds.isEmpty()) {
            try {
                List<Object> rawIds = notificationRepository.findAllUserIds();
                if (rawIds != null) {
                    for (Object obj : rawIds) {
                        if (obj instanceof Number) {
                            userIds.add(((Number) obj).intValue());
                        } else if (obj != null) {
                            try {
                                userIds.add(Integer.parseInt(obj.toString().trim()));
                            } catch (Exception ignored) {}
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (userIds.isEmpty()) {
            for (int i = 1; i <= 25; i++) {
                userIds.add(i);
            }
        }
        return userIds;
    }

    @Override
    public SystemBroadcast createBroadcast(Integer senderId, String title, String message, String type, String targetAudience) {
        List<Integer> targetUserIds = getAllTargetUserIds(targetAudience);

        SystemBroadcast broadcast = SystemBroadcast.builder()
                .senderId(senderId != null ? senderId : 1)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .targetAudience(targetAudience != null ? targetAudience : "ALL_USERS")
                .recipientsCount(targetUserIds.size())
                .isSent(true)
                .sentAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
        
        SystemBroadcast saved = systemBroadcastRepository.save(broadcast);

        // Sebarkan notifikasi ke seluruh pengguna yang terdaftar secara dinamis
        NotificationType notifType = NotificationType.SYSTEM;
        if ("TIPS".equalsIgnoreCase(type)) {
            notifType = NotificationType.INFO;
        }

        for (Integer uId : targetUserIds) {
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
            } catch (Exception e) {
                System.err.println("Gagal simpan broadcast untuk userId " + uId + ": " + e.getMessage());
            }
        }

        return saved;
    }

    @Override
    public List<SystemBroadcast> getAllBroadcasts() {
        return systemBroadcastRepository.findAllByOrderBySentAtDesc();
    }
}
