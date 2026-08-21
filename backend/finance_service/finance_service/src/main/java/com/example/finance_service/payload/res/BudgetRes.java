package com.example.finance_service.payload.res;

import java.math.BigDecimal;
import com.example.finance_service.entity.Budget;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRes {
    private Budget budget;
    private BigDecimal usedAmount;
    private Double percentageUsed;
}
