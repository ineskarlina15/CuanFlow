package com.example.finance_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.finance_service.entity.FinancialGoal;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Integer> {
    List<FinancialGoal> findByUserId(Integer userId);
    Optional<FinancialGoal> findByIdAndUserId(Integer id, Integer userId);
}
