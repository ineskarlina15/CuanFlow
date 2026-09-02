package com.example.finance_service.payload.req;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.finance_service.entity.PaymentMethod;
import com.example.finance_service.entity.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionReq {
    @NotNull(message = "Kategori wajib dipilih")
    private Integer categoryId;

    @NotNull(message = "Tipe transaksi wajib diisi (INCOME/EXPENSE)")
    private TransactionType type;

    @NotNull(message = "Nominal wajib diisi")
    @DecimalMin(value = "1.00", message = "Nominal harus lebih besar dari 0")
    private BigDecimal amount;

    @NotBlank(message = "Judul transaksi tidak boleh kosong")
    private String title;

    private String description;

    @NotNull(message = "Tanggal transaksi wajib diisi")
    private LocalDate transactionDate;

    @NotNull(message = "Metode pembayaran wajib dipilih")
    private PaymentMethod paymentMethod;

    private List<Integer> tagIds;
}
