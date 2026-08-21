package com.example.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.notification_service.entity.FinancialGoal;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Integer> {
    List<FinancialGoal> findByStatus(String status);
}
