package com.example.finance_service.payload.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagReq {
    @NotBlank(message = "Nama tag tidak boleh kosong")
    private String name;
}
