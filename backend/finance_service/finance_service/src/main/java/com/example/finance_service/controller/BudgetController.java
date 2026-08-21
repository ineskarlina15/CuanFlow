package com.example.finance_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.finance_service.payload.req.BudgetReq;
import com.example.finance_service.service.BudgetService;
import com.example.finance_service.utility.Message;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {
    @Autowired
    private BudgetService budgetService;

    @Autowired
    private Message message;

    @PostMapping
    public ResponseEntity<?> create(@RequestAttribute("userId") Integer userId, @Valid @RequestBody BudgetReq request) {
        try {
            return message.getData("Budget berhasil dibuat", budgetService.createBudget(userId, request), 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestAttribute("userId") Integer userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        try {
            return message.getData("Berhasil mengambil data budget", budgetService.getBudgetsByUserId(userId, month, year), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil detail budget", budgetService.getBudgetById(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestAttribute("userId") Integer userId, @PathVariable Integer id, @Valid @RequestBody BudgetReq request) {
        try {
            return message.getData("Budget berhasil diperbarui", budgetService.updateBudget(userId, id, request), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            budgetService.deleteBudget(userId, id);
            return message.success("Budget berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
