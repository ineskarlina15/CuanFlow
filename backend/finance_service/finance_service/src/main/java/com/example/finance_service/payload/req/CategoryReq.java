package com.example.finance_service.payload.req;

import com.example.finance_service.entity.CategoryType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryReq {
    @NotBlank(message = "Nama kategori tidak boleh kosong")
    private String name;

    @NotNull(message = "Tipe kategori wajib dipilih (INCOME atau EXPENSE)")
    private CategoryType type;
    @NotBlank(message = "Deskripsi kategori tidak boleh kosong")
    private String description;
    private String icon;
}
