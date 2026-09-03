package com.example.finance_service.service;

import java.util.List;
import com.example.finance_service.entity.FinancialGoal;
import com.example.finance_service.payload.req.FinancialGoalReq;

public interface FinancialGoalService {
    FinancialGoal createGoal(Integer userId, FinancialGoalReq request) throws Exception;
    List<FinancialGoal> getGoalsByUserId(Integer userId);
    FinancialGoal getGoalById(Integer userId, Integer id) throws Exception;
    FinancialGoal updateGoal(Integer userId, Integer id, FinancialGoalReq request) throws Exception;
    FinancialGoal updateGoalProgress(Integer userId, Integer id, java.math.BigDecimal amount) throws Exception;
    void deleteGoal(Integer userId, Integer id) throws Exception;
}
