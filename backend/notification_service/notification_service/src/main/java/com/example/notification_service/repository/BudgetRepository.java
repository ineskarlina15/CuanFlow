package com.example.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.notification_service.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    
    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) " +
                   "FROM transactions t " +
                   "JOIN budget_categories bc ON t.category_id = bc.category_id " +
                   "WHERE bc.budget_id = :budgetId " +
                   "AND t.type = 'EXPENSE' " +
                   "AND t.transaction_date BETWEEN :startDate AND :endDate", nativeQuery = true)
    java.math.BigDecimal calculateTotalSpent(@Param("budgetId") Integer budgetId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
    
    List<Budget> findByStatus(String status);
}
