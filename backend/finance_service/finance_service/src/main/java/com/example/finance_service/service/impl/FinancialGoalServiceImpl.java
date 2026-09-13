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
        if (request.getCurrentAmount() != null && request.getTargetAmount() != null 
                && request.getCurrentAmount().compareTo(request.getTargetAmount()) > 0) {
            throw new Exception("Jumlah awal tabungan tidak boleh melebihi target tabungan");
        }

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
        
        java.math.BigDecimal target = request.getTargetAmount() != null ? request.getTargetAmount() : goal.getTargetAmount();
        if (request.getCurrentAmount() != null && target != null 
                && request.getCurrentAmount().compareTo(target) > 0) {
            throw new Exception("Jumlah tabungan tidak boleh melebihi target tabungan");
        }

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        } else if (goal.getTargetAmount() != null && goal.getCurrentAmount() != null) {
            if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
                goal.setStatus("COMPLETED");
            } else if (!"CANCELLED".equals(goal.getStatus())) {
                goal.setStatus("ACTIVE");
            }
        }

        return financialGoalRepository.save(goal);
    }

    @Override
    public FinancialGoal updateGoalProgress(Integer userId, Integer id, java.math.BigDecimal amount) throws Exception {
        FinancialGoal goal = getGoalById(userId, id);
        java.math.BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal target = goal.getTargetAmount() != null ? goal.getTargetAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal remaining = target.subtract(current);

        if (remaining.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new Exception("Target tabungan ini sudah tercapai penuh");
        }

        if (amount != null && amount.compareTo(remaining) > 0) {
            throw new Exception("Nominal tabungan melebihi sisa kekurangan target (Maksimal: Rp " + remaining.stripTrailingZeros().toPlainString() + ")");
        }

        java.math.BigDecimal updated = current.add(amount != null ? amount : java.math.BigDecimal.ZERO);
        goal.setCurrentAmount(updated);
        if (target.compareTo(java.math.BigDecimal.ZERO) > 0 && updated.compareTo(target) >= 0) {
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
