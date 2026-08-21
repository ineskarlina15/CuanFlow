package com.example.finance_service.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.finance_service.service.TransactionService;
import com.example.finance_service.utility.Message;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private Message message;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            return message.getData("Berhasil mengambil data analitik laporan", 
                    transactionService.getDashboardAnalytics(userId, startDate, endDate), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }
}
