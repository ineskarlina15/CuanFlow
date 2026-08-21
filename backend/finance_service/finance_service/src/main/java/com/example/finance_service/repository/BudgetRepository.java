package com.example.finance_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.finance_service.entity.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    List<Budget> findByUserId(Integer userId);
    List<Budget> findByUserIdAndMonthAndYear(Integer userId, Integer month, Integer year);
    Optional<Budget> findByIdAndUserId(Integer id, Integer userId);
    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(Integer userId, Integer categoryId, Integer month, Integer year);
}
