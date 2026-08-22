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
import com.example.notification_service.repository.BudgetRepository;
import com.example.notification_service.repository.FinancialGoalRepository;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.service.NotificationService;


@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private FinancialGoalRepository financialGoalRepository;

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

    // ==========================================
    // SCHEDULER (PENGECEKAN OTOMATIS)
    // ==========================================
    
    /**
     * Berjalan setiap hari pada jam 08:00 Pagi (Waktu logis untuk pengingat keuangan)
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void runDailyChecks() {
        System.out.println("Memulai pengecekan otomatis untuk notifikasi...");
        checkBudgets();
        checkFinancialGoals();
        System.out.println("Pengecekan selesai.");
    }

    private void checkBudgets() {
        List<Budget> activeBudgets = budgetRepository.findByStatus("ACTIVE");
        LocalDate today = LocalDate.now();

        for (Budget budget : activeBudgets) {
            if (!today.isBefore(budget.getStartDate()) && !today.isAfter(budget.getEndDate())) {
                BigDecimal totalSpent = budgetRepository.calculateTotalSpent(budget.getId(), budget.getStartDate(), budget.getEndDate());
                BigDecimal alertThreshold = budget.getAmount()
                        .multiply(new BigDecimal(budget.getAlertPercentage()))
                        .divide(new BigDecimal(100));

                if (totalSpent.compareTo(alertThreshold) >= 0) {
                    String title = "Peringatan Anggaran: " + budget.getName();
                    String message = String.format("Awas! Pengeluaran Anda (Rp%,.2f) sudah mencapai atau melebihi %d%% dari batas anggaran (Rp%,.2f).", 
                            totalSpent, budget.getAlertPercentage(), budget.getAmount());

                    createNotificationIfNotExists(budget.getUserId(), NotificationType.BUDGET_ALERT, title, message);
                }
            }
        }
    }

    private void checkFinancialGoals() {
        List<FinancialGoal> activeGoals = financialGoalRepository.findByStatus("ACTIVE");
        LocalDate today = LocalDate.now();

        for (FinancialGoal goal : activeGoals) {
            if (goal.getTargetDate() != null) {
                long daysRemaining = ChronoUnit.DAYS.between(today, goal.getTargetDate());
                if (daysRemaining <= 7 && daysRemaining >= 0 && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) < 0) {
                    String title = "Pengingat Target Tabungan: " + goal.getName();
                    String message = String.format("Target Anda tersisa %d hari lagi. Terkumpul Rp%,.2f dari Rp%,.2f. Ayo semangat nabung!", 
                            daysRemaining, goal.getCurrentAmount(), goal.getTargetAmount());

                    createNotificationIfNotExists(goal.getUserId(), NotificationType.GOAL_REMINDER, title, message);
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
}
