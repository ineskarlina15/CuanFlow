package com.example.finance_service.service.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.finance_service.entity.Transaction;
import com.example.finance_service.repository.AttachmentRepository;
import com.example.finance_service.repository.CategoryRepository;
import com.example.finance_service.repository.TransactionRepository;
import com.example.finance_service.utility.FileUtility;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private FileUtility fileUtility;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    @Test
    void userCannotReadAnotherUsersTransaction() {
        when(transactionRepository.findByIdAndUserIdAndDeletedAtIsNull(7, 2))
                .thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> transactionService.getTransactionById(2, 7));
    }

    @Test
    void userCannotDeleteAnotherUsersTransaction() {
        when(transactionRepository.findByIdAndUserIdAndDeletedAtIsNull(7, 2))
                .thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> transactionService.deleteTransaction(2, 7));
        verify(transactionRepository, never()).softDeleteByIdAndUserId(7, 2);
    }
}
