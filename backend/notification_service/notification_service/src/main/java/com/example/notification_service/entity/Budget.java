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
@Table(name = "budgets")
public class Budget {
    @Id
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    private String name;
    
    private BigDecimal amount;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "alert_percentage")
    private Integer alertPercentage;

    private String status;
}
