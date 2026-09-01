package com.example.finance_service.service.impl;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.finance_service.entity.Attachment;
import com.example.finance_service.entity.Category;
import com.example.finance_service.entity.Transaction;
import com.example.finance_service.payload.req.TransactionReq;
import com.example.finance_service.repository.AttachmentRepository;
import com.example.finance_service.repository.CategoryRepository;
import com.example.finance_service.repository.TransactionRepository;
import com.example.finance_service.service.TransactionService;
import com.example.finance_service.utility.FileUtility;

@Service
public class TransactionServiceImpl implements TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private FileUtility fileUtility;

    @Override
    @Transactional(rollbackFor = Exception.class) // Memastikan jika upload gagal, data DB dibatalkan
    public Transaction createTransaction(Integer userId, TransactionReq request, MultipartFile file) throws Exception {
        
        // 1. Validasi Kategori
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan"));
        validateCategoryType(category, request);

        // 2. Simpan Data Transaksi Utama
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        applyTransactionData(transaction, category, request);
        
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 3. Proses File Upload jika ada lampiran yang dikirim
        if (file != null && !file.isEmpty()) {
            String fileUrl = fileUtility.saveFile(file); // Panggil alat pengunggah

            Attachment attachment = new Attachment();
            attachment.setTransaction(savedTransaction);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(fileUrl);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            
            attachmentRepository.save(attachment);
        }

        return savedTransaction;
    }

    @Override
    public Transaction getTransactionById(Integer userId, Integer transactionId) throws Exception {
        return transactionRepository.findByIdAndUserIdAndDeletedAtIsNull(transactionId, userId)
                .orElseThrow(() -> new Exception("Transaksi tidak ditemukan"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Transaction updateTransaction(Integer userId, Integer transactionId, TransactionReq request, MultipartFile file)
            throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan"));
        validateCategoryType(category, request);

        applyTransactionData(transaction, category, request);
        Transaction savedTransaction = transactionRepository.save(transaction);

        if (file != null && !file.isEmpty()) {
            attachmentRepository.deleteByTransactionId(savedTransaction.getId());
            String fileUrl = fileUtility.saveFile(file);

            Attachment attachment = new Attachment();
            attachment.setTransaction(savedTransaction);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(fileUrl);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachmentRepository.save(attachment);
        }

        return savedTransaction;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTransaction(Integer userId, Integer transactionId) throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);
        // Soft delete instead of hard delete
        transactionRepository.softDeleteByIdAndUserId(transaction.getId(), userId);
    }

    @Override
    public byte[] exportTransactionsReport(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception {
        List<Transaction> transactions = transactionRepository.findTransactionsForReport(userId, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Laporan Transaksi");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("Laporan Transaksi CuanFlow");

            Row periodRow = sheet.createRow(1);
            periodRow.createCell(0).setCellValue("Periode");
            periodRow.createCell(1).setCellValue(formatPeriod(startDate, endDate));

            Row header = sheet.createRow(3);
            String[] columns = {"Tanggal", "Tipe", "Kategori", "Judul", "Nominal", "Metode Pembayaran", "Deskripsi"};
            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
                header.getCell(i).setCellStyle(headerStyle);
            }

            int rowNumber = 4;
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;

            for (Transaction transaction : transactions) {
                Row row = sheet.createRow(rowNumber++);
                row.createCell(0).setCellValue(transaction.getTransactionDate().toString());
                row.createCell(1).setCellValue(transaction.getType().name());
                row.createCell(2).setCellValue(transaction.getCategory().getName());
                row.createCell(3).setCellValue(transaction.getTitle());
                row.createCell(4).setCellValue(transaction.getAmount().doubleValue());
                row.createCell(5).setCellValue(transaction.getPaymentMethod().name());
                row.createCell(6).setCellValue(transaction.getDescription() != null ? transaction.getDescription() : "");

                if ("INCOME".equals(transaction.getType().name())) {
                    totalIncome = totalIncome.add(transaction.getAmount());
                } else {
                    totalExpense = totalExpense.add(transaction.getAmount());
                }
            }

            Row summaryHeader = sheet.createRow(rowNumber + 1);
            summaryHeader.createCell(0).setCellValue("Ringkasan");
            summaryHeader.getCell(0).setCellStyle(headerStyle);

            Row incomeRow = sheet.createRow(rowNumber + 2);
            incomeRow.createCell(0).setCellValue("Total Pemasukan");
            incomeRow.createCell(1).setCellValue(totalIncome.doubleValue());

            Row expenseRow = sheet.createRow(rowNumber + 3);
            expenseRow.createCell(0).setCellValue("Total Pengeluaran");
            expenseRow.createCell(1).setCellValue(totalExpense.doubleValue());

            Row balanceRow = sheet.createRow(rowNumber + 4);
            balanceRow.createCell(0).setCellValue("Saldo Akhir");
            balanceRow.createCell(1).setCellValue(totalIncome.subtract(totalExpense).doubleValue());

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public Page<Transaction> getFilteredTransactions(Integer userId, String keyword, Integer categoryId, LocalDate startDate, LocalDate endDate, int page, int size, String sortBy) {
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        Sort sort;
        if (sortBy != null && !sortBy.isBlank()) {
            String cleanSort = sortBy.trim();
            if (cleanSort.equalsIgnoreCase("transactionDate_asc")) {
                sort = Sort.by(Sort.Direction.ASC, "transactionDate");
            } else if (cleanSort.equalsIgnoreCase("transactionDate_desc") || cleanSort.equalsIgnoreCase("transactionDate")) {
                sort = Sort.by(Sort.Direction.DESC, "transactionDate");
            } else if (cleanSort.equalsIgnoreCase("title_asc") || cleanSort.equalsIgnoreCase("title")) {
                sort = Sort.by(Sort.Direction.ASC, "title");
            } else if (cleanSort.equalsIgnoreCase("title_desc")) {
                sort = Sort.by(Sort.Direction.DESC, "title");
            } else if (cleanSort.equalsIgnoreCase("amount_asc")) {
                sort = Sort.by(Sort.Direction.ASC, "amount");
            } else if (cleanSort.equalsIgnoreCase("amount_desc")) {
                sort = Sort.by(Sort.Direction.DESC, "amount");
            } else {
                sort = Sort.by(Sort.Direction.DESC, "transactionDate");
            }
        } else {
            sort = Sort.by(Sort.Direction.DESC, "transactionDate");
        }
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return transactionRepository.findFilteredTransactions(userId, keyword, categoryId, startDate, endDate, pageable);
    }

    @Override
    public Map<String, BigDecimal> getDashboardSummary(Integer userId) {
        // Kalkulasi real-time yang cepat untuk Dashboard React
        BigDecimal totalIncome = transactionRepository.calculateTotalAmountByType(userId, "INCOME");
        BigDecimal totalExpense = transactionRepository.calculateTotalAmountByType(userId, "EXPENSE");
        BigDecimal balance = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("currentBalance", balance);
        
        return summary;
    }

    @Override
    public Map<String, Object> getDashboardAnalytics(Integer userId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> analytics = new HashMap<>();

        List<Object[]> expenseCategories = transactionRepository.calculateCategorySummary(userId, "EXPENSE", startDate, endDate);
        List<Object[]> incomeCategories = transactionRepository.calculateCategorySummary(userId, "INCOME", startDate, endDate);

        analytics.put("expenseByCategory", expenseCategories);
        analytics.put("incomeByCategory", incomeCategories);

        return analytics;
    }

    @Override
    public List<Attachment> getAttachmentsByTransactionId(Integer userId, Integer transactionId) throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);
        return attachmentRepository.findByTransactionId(transaction.getId());
    }

    private void applyTransactionData(Transaction transaction, Category category, TransactionReq request) {
        transaction.setCategory(category);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setTitle(request.getTitle());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod());
    }

    private void validateCategoryType(Category category, TransactionReq request) throws Exception {
        if (category.getDeletedAt() != null) {
            throw new Exception("Kategori ini sudah dihapus");
        }
        if (category.getType() != null && request.getType() != null && !category.getType().name().equals(request.getType().name())) {
            // Update category type to match transaction type enum
            try {
                category.setType(com.example.finance_service.entity.CategoryType.valueOf(request.getType().name()));
                categoryRepository.save(category);
            } catch (Exception ignored) {
            }
        }
    }

    private String formatPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "Semua tanggal";
        }
        String start = startDate != null ? startDate.toString() : "Awal";
        String end = endDate != null ? endDate.toString() : "Akhir";
        return start + " sampai " + end;
    }
}
