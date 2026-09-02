package com.example.finance_service.payload.req;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialGoalReq {
    @NotBlank(message = "Nama target tidak boleh kosong")
    private String name;

    @NotNull(message = "Target nominal tidak boleh kosong")
    private BigDecimal targetAmount;

    private BigDecimal currentAmount = BigDecimal.ZERO;

    @NotNull(message = "Tanggal target tidak boleh kosong")
    private LocalDate targetDate;

    private String description;
    
    private String status;
}
