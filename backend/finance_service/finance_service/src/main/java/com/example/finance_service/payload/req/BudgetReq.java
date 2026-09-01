package com.example.finance_service.payload.req;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetReq {
    private String name;

    @NotNull(message = "Kategori tidak boleh kosong")
    private Integer categoryId;

    @NotNull(message = "Jumlah tidak boleh kosong")
    private BigDecimal amount;

    private String description;

    private Integer alertThreshold;

    @NotNull(message = "Bulan tidak boleh kosong")
    private Integer month;

    @NotNull(message = "Tahun tidak boleh kosong")
    private Integer year;

    private LocalDate startDate;

    private LocalDate endDate;
}
