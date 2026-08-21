package com.example.finance_service.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finance_service.entity.Budget;
import com.example.finance_service.entity.Category;
import com.example.finance_service.payload.req.BudgetReq;
import com.example.finance_service.payload.res.BudgetRes;
import com.example.finance_service.repository.BudgetRepository;
import com.example.finance_service.repository.CategoryRepository;
import com.example.finance_service.repository.TransactionRepository;
import com.example.finance_service.service.BudgetService;

@Service
public class BudgetServiceImpl implements BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public Budget createBudget(Integer userId, BudgetReq request) throws Exception {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan"));

        if (!"EXPENSE".equals(category.getType().name())) {
            throw new Exception("Budget hanya bisa dibuat untuk kategori pengeluaran");
        }

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.getCategoryId(), request.getMonth(), request.getYear());

        if (existingBudget.isPresent()) {
            throw new Exception("Budget untuk kategori ini di bulan dan tahun yang sama sudah ada");
        }

        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setCategory(category);
        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        return budgetRepository.save(budget);
    }

    @Override
    public List<BudgetRes> getBudgetsByUserId(Integer userId, Integer month, Integer year) {
        List<Budget> budgets;
        if (month != null && year != null) {
            budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        } else {
            budgets = budgetRepository.findByUserId(userId);
        }

        List<BudgetRes> response = new ArrayList<>();
        for (Budget budget : budgets) {
            BigDecimal usedAmount = transactionRepository.calculateTotalSpentByCategoryAndMonth(
                    userId, budget.getCategory().getId(), budget.getMonth(), budget.getYear());

            Double percentageUsed = 0.0;
            if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentageUsed = usedAmount.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            }

            response.add(new BudgetRes(budget, usedAmount, percentageUsed));
        }

        return response;
    }

    @Override
    public Budget getBudgetById(Integer userId, Integer id) throws Exception {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new Exception("Budget tidak ditemukan"));
    }

    @Override
    public Budget updateBudget(Integer userId, Integer id, BudgetReq request) throws Exception {
        Budget budget = getBudgetById(userId, id);
        
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan"));

        if (!"EXPENSE".equals(category.getType().name())) {
            throw new Exception("Budget hanya bisa dibuat untuk kategori pengeluaran");
        }
        
        // Cek duplikasi jika kategori, bulan, atau tahun diubah
        if (!budget.getCategory().getId().equals(request.getCategoryId()) || 
            !budget.getMonth().equals(request.getMonth()) || 
            !budget.getYear().equals(request.getYear())) {
            
            Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                    userId, request.getCategoryId(), request.getMonth(), request.getYear());

            if (existingBudget.isPresent()) {
                throw new Exception("Budget untuk kategori ini di bulan dan tahun yang sama sudah ada");
            }
        }

        budget.setCategory(category);
        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        return budgetRepository.save(budget);
    }

    @Override
    public void deleteBudget(Integer userId, Integer id) throws Exception {
        Budget budget = getBudgetById(userId, id);
        budgetRepository.delete(budget); // Hard delete karena tidak ada deletedAt
    }
}
