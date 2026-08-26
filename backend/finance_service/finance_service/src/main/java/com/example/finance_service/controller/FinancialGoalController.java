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
import org.springframework.web.bind.annotation.RestController;

import com.example.finance_service.payload.req.FinancialGoalReq;
import com.example.finance_service.service.FinancialGoalService;
import com.example.finance_service.utility.Message;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/goals")
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class FinancialGoalController {
    @Autowired
    private FinancialGoalService financialGoalService;

    @Autowired
    private Message message;

    @PostMapping
    public ResponseEntity<?> create(@RequestAttribute("userId") Integer userId, @Valid @RequestBody FinancialGoalReq request) {
        try {
            return message.getData("Target tabungan berhasil dibuat", financialGoalService.createGoal(userId, request), 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestAttribute("userId") Integer userId) {
        try {
            return message.getData("Berhasil mengambil data target tabungan", financialGoalService.getGoalsByUserId(userId), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil detail target tabungan", financialGoalService.getGoalById(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestAttribute("userId") Integer userId, @PathVariable Integer id, @Valid @RequestBody FinancialGoalReq request) {
        try {
            return message.getData("Target tabungan berhasil diperbarui", financialGoalService.updateGoal(userId, id, request), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            financialGoalService.deleteGoal(userId, id);
            return message.success("Target tabungan berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
