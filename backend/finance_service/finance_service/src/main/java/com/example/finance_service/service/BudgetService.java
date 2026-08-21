package com.example.finance_service.service;

import java.util.List;
import com.example.finance_service.entity.Budget;
import com.example.finance_service.payload.req.BudgetReq;
import com.example.finance_service.payload.res.BudgetRes;

public interface BudgetService {
    Budget createBudget(Integer userId, BudgetReq request) throws Exception;
    List<BudgetRes> getBudgetsByUserId(Integer userId, Integer month, Integer year);
    Budget getBudgetById(Integer userId, Integer id) throws Exception;
    Budget updateBudget(Integer userId, Integer id, BudgetReq request) throws Exception;
    void deleteBudget(Integer userId, Integer id) throws Exception;
}
