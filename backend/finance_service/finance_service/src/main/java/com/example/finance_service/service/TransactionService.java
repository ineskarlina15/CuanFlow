package com.example.finance_service.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.example.finance_service.entity.Transaction;
import com.example.finance_service.payload.req.TransactionReq;

public interface TransactionService {
    // Parameter menangkap JSON data + File Bukti
    Transaction createTransaction(Integer userId, TransactionReq request, MultipartFile file) throws Exception;

    Transaction getTransactionById(Integer userId, Integer transactionId) throws Exception;

    Transaction updateTransaction(Integer userId, Integer transactionId, TransactionReq request, MultipartFile file) throws Exception;

    Transaction patchTransaction(Integer userId, Integer transactionId, Map<String, Object> updates) throws Exception;

    void deleteTransaction(Integer userId, Integer transactionId) throws Exception;

    byte[] exportTransactionsReport(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception;
    byte[] exportTransactionsPdf(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception;
    
    // Fitur advanced: Multi-filter & Pagination
    Page<Transaction> getFilteredTransactions(Integer userId, String keyword, Integer categoryId, String type, LocalDate startDate, LocalDate endDate, int page, int size, String sortBy);
    
    // Fitur Dashboard: Kalkulasi
    Map<String, BigDecimal> getDashboardSummary(Integer userId);

    Map<String, Object> getDashboardAnalytics(Integer userId, LocalDate startDate, LocalDate endDate);

    List<com.example.finance_service.entity.Attachment> getAttachmentsByTransactionId(Integer userId, Integer transactionId) throws Exception;
}
