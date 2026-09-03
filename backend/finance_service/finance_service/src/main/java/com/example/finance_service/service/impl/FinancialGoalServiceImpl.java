package com.example.finance_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finance_service.entity.FinancialGoal;
import com.example.finance_service.payload.req.FinancialGoalReq;
import com.example.finance_service.repository.FinancialGoalRepository;
import com.example.finance_service.service.FinancialGoalService;

@Service
public class FinancialGoalServiceImpl implements FinancialGoalService {
    @Autowired
    private FinancialGoalRepository financialGoalRepository;

    @Override
    public FinancialGoal createGoal(Integer userId, FinancialGoalReq request) throws Exception {
        FinancialGoal goal = new FinancialGoal();
        goal.setUserId(userId);
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : java.math.BigDecimal.ZERO);
        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription());
        goal.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        return financialGoalRepository.save(goal);
    }

    @Override
    public List<FinancialGoal> getGoalsByUserId(Integer userId) {
        return financialGoalRepository.findByUserId(userId);
    }

    @Override
    public FinancialGoal getGoalById(Integer userId, Integer id) throws Exception {
        return financialGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new Exception("Target tabungan tidak ditemukan"));
    }

    @Override
    public FinancialGoal updateGoal(Integer userId, Integer id, FinancialGoalReq request) throws Exception {
        FinancialGoal goal = getGoalById(userId, id);
        
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        return financialGoalRepository.save(goal);
    }

    @Override
    public FinancialGoal updateGoalProgress(Integer userId, Integer id, java.math.BigDecimal amount) throws Exception {
        FinancialGoal goal = getGoalById(userId, id);
        java.math.BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal updated = current.add(amount != null ? amount : java.math.BigDecimal.ZERO);
        goal.setCurrentAmount(updated);
        if (goal.getTargetAmount() != null && updated.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }
        return financialGoalRepository.save(goal);
    }

    @Override
    public void deleteGoal(Integer userId, Integer id) throws Exception {
        FinancialGoal goal = getGoalById(userId, id);
        financialGoalRepository.delete(goal);
    }
}
