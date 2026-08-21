package com.example.notification_service.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "financial_goals")
public class FinancialGoal {
    @Id
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    private String name;

    @Column(name = "target_amount")
    private BigDecimal targetAmount;

    @Column(name = "current_amount")
    private BigDecimal currentAmount;

    @Column(name = "target_date")
    private LocalDate targetDate;

    private String status;
}
