package com.example.finance_service.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.finance_service.payload.req.TransactionReq;
import com.example.finance_service.service.TransactionService;
import com.example.finance_service.utility.Message;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/transactions")
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private Message message;

    // 1. Endpoint Create dengan Upload File (Multipart)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTransaction(
            @RequestAttribute("userId") Integer userId,
            @RequestPart("data") @Valid TransactionReq request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            return message.getData("Transaksi berhasil dicatat", 
                    transactionService.createTransaction(userId, request, file), 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    // 2. Endpoint List dengan Multi-Filter & Pagination Terintegrasi
    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "transactionDate") String sortBy) {
        try {
            return message.getData("Berhasil mengambil data transaksi", 
                    transactionService.getFilteredTransactions(userId, keyword, categoryId, type, startDate, endDate, page, size, sortBy), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil detail transaksi",
                    transactionService.getTransactionById(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportTransactions(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] report = transactionService.exportTransactionsReport(userId, startDate, endDate);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laporan-cuanflow.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(report);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<?> exportTransactionsPdf(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] report = transactionService.exportTransactionsPdf(userId, startDate, endDate);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laporan-cuanflow.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(report);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateTransaction(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id,
            @RequestPart("data") @Valid TransactionReq request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            return message.getData("Transaksi berhasil diperbarui",
                    transactionService.updateTransaction(userId, id, request, file), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patchTransaction(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {
        try {
            return message.getData("Transaksi berhasil diperbarui sebagian (PATCH)",
                    transactionService.patchTransaction(userId, id, updates), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            transactionService.deleteTransaction(userId, id);
            return message.success("Transaksi berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    // 3. Endpoint Khusus Dashboard (Kalkulasi Cepat)
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardSummary(@RequestAttribute("userId") Integer userId) {
        try {
            return message.getData("Berhasil memuat ringkasan dashboard", 
                    transactionService.getDashboardSummary(userId), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    // 4. Endpoint Attachment
    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> getTransactionAttachments(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil lampiran transaksi", 
                    transactionService.getAttachmentsByTransactionId(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }
}
