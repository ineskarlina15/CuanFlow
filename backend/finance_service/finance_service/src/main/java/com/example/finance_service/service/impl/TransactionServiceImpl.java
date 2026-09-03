package com.example.finance_service.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.example.finance_service.entity.Tag;
import com.example.finance_service.entity.Transaction;
import com.example.finance_service.payload.req.TransactionReq;
import com.example.finance_service.repository.AttachmentRepository;
import com.example.finance_service.repository.CategoryRepository;
import com.example.finance_service.repository.TagRepository;
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
    private TagRepository tagRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private FileUtility fileUtility;

    @Autowired
    private com.example.finance_service.utility.ExportUtility exportUtility;

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
        applyTransactionData(transaction, category, request, userId);

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
    public Transaction updateTransaction(Integer userId, Integer transactionId, TransactionReq request,
            MultipartFile file)
            throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan"));
        validateCategoryType(category, request);

        applyTransactionData(transaction, category, request, userId);
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
        // Hapus lunak (soft delete) alih-alih hapus permanen (hard delete)
        transactionRepository.softDeleteByIdAndUserId(transaction.getId(), userId);
    }

    @Override
    public byte[] exportTransactionsReport(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception {
        List<Transaction> transactions = transactionRepository.findTransactionsForReport(userId, startDate, endDate);
        return exportUtility.exportTransactionsToExcel(transactions).readAllBytes();
    }

    @Override
    public byte[] exportTransactionsPdf(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception {
        List<Transaction> transactions = transactionRepository.findTransactionsForReport(userId, startDate, endDate);
        return exportUtility.exportTransactionsToPdf(transactions).readAllBytes();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Transaction patchTransaction(Integer userId, Integer transactionId, Map<String, Object> updates) throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);

        if (updates.containsKey("title") && updates.get("title") != null) {
            transaction.setTitle(updates.get("title").toString());
        }
        if (updates.containsKey("description")) {
            transaction.setDescription(updates.get("description") != null ? updates.get("description").toString() : null);
        }
        if (updates.containsKey("amount") && updates.get("amount") != null) {
            transaction.setAmount(new BigDecimal(updates.get("amount").toString()));
        }
        if (updates.containsKey("transactionDate") && updates.get("transactionDate") != null) {
            transaction.setTransactionDate(LocalDate.parse(updates.get("transactionDate").toString()));
        }

        return transactionRepository.save(transaction);
    }

    @Override
    public Page<Transaction> getFilteredTransactions(Integer userId, String keyword, Integer categoryId,
            String type, LocalDate startDate, LocalDate endDate, int page, int size, String sortBy) {
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        if (type != null && (type.trim().isEmpty() || type.equalsIgnoreCase("ALL"))) {
            type = null;
        }
        Sort sort;
        if (sortBy != null && !sortBy.isBlank()) {
            String cleanSort = sortBy.trim();
            if (cleanSort.equalsIgnoreCase("transactionDate_asc")) {
                sort = Sort.by(Sort.Direction.ASC, "transactionDate");
            } else if (cleanSort.equalsIgnoreCase("transactionDate_desc")
                    || cleanSort.equalsIgnoreCase("transactionDate")) {
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

        return transactionRepository.findFilteredTransactions(userId, keyword, categoryId, type, startDate, endDate,
                pageable);
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

        List<Object[]> expenseCategories = transactionRepository.calculateCategorySummary(userId, "EXPENSE", startDate,
                endDate);
        List<Object[]> incomeCategories = transactionRepository.calculateCategorySummary(userId, "INCOME", startDate,
                endDate);

        analytics.put("expenseByCategory", expenseCategories);
        analytics.put("incomeByCategory", incomeCategories);

        return analytics;
    }

    @Override
    public List<Attachment> getAttachmentsByTransactionId(Integer userId, Integer transactionId) throws Exception {
        Transaction transaction = getTransactionById(userId, transactionId);
        return attachmentRepository.findByTransactionId(transaction.getId());
    }

    private void applyTransactionData(Transaction transaction, Category category, TransactionReq request,
            Integer userId) {
        transaction.setCategory(category);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setTitle(request.getTitle());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod());

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findByIdInAndUserId(request.getTagIds(), userId);
            transaction.setTags(tags);
        } else {
            transaction.setTags(new java.util.ArrayList<>());
        }
    }

    private void validateCategoryType(Category category, TransactionReq request) throws Exception {
        if (category.getDeletedAt() != null) {
            throw new Exception("Kategori ini sudah dihapus");
        }
        if (category.getType() != null && request.getType() != null
                && !category.getType().name().equals(request.getType().name())) {
            // Perbarui tipe kategori agar sesuai dengan enum tipe transaksi
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
