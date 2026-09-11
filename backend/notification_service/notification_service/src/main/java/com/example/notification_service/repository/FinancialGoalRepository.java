package com.example.notification_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.notification_service.entity.FinancialGoal;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Integer> {
}
