package com.example.finance_service.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.finance_service.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    Optional<Transaction> findByIdAndUserIdAndDeletedAtIsNull(Integer id, Integer userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND t.deletedAt IS NULL " +
           "AND (CAST(:startDate AS date) IS NULL OR t.transactionDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.transactionDate <= :endDate) " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findTransactionsForReport(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // FITUR SPEKTAKULER 1: Multi-Filter (Search + Kategori + Pagination)
    // Syarat wajib proyek S1: "Search, Filter, Sorting, Pagination" dalam 1 API terpadu
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND t.deletedAt IS NULL " +
           "AND (CAST(:keyword AS string) IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "AND (CAST(:categoryId AS integer) IS NULL OR t.category.id = :categoryId) " +
           "AND (CAST(:startDate AS date) IS NULL OR t.transactionDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.transactionDate <= :endDate)")
    Page<Transaction> findFilteredTransactions(
            @Param("userId") Integer userId,
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    // FITUR SPEKTAKULER 2: Kalkulator Saldo Super Cepat
    // Dipakai untuk Dashboard agar tidak perlu menarik jutaan baris data ke Java
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.deletedAt IS NULL AND CAST(t.type AS string) = :type")
    BigDecimal calculateTotalAmountByType(
            @Param("userId") Integer userId, 
            @Param("type") String type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.deletedAt IS NULL AND CAST(t.type AS string) = :type " +
           "AND (CAST(:startDate AS date) IS NULL OR t.transactionDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.transactionDate <= :endDate)")
    BigDecimal calculateTotalAmountByTypeAndDate(
            @Param("userId") Integer userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.category.id = :categoryId AND t.deletedAt IS NULL " +
           "AND MONTH(t.transactionDate) = :month " +
           "AND YEAR(t.transactionDate) = :year")
    BigDecimal calculateTotalSpentByCategoryAndMonth(
            @Param("userId") Integer userId,
            @Param("categoryId") Integer categoryId,
            @Param("month") Integer month,
            @Param("year") Integer year);

    @Query("SELECT t.category.name, COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.deletedAt IS NULL AND CAST(t.type AS string) = :type " +
           "AND (CAST(:startDate AS date) IS NULL OR t.transactionDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR t.transactionDate <= :endDate) " +
           "GROUP BY t.category.name ORDER BY COALESCE(SUM(t.amount), 0) DESC")
    List<Object[]> calculateCategorySummary(
            @Param("userId") Integer userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.deletedAt = CURRENT_TIMESTAMP WHERE t.id = :id AND t.userId = :userId")
    void softDeleteByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);
}
