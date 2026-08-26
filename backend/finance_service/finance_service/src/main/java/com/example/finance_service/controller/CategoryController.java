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
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestAttribute;

import com.example.finance_service.payload.req.CategoryReq;
import com.example.finance_service.service.CategoryService;
import com.example.finance_service.utility.Message;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/categories")
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private Message message;

    @PostMapping
    public ResponseEntity<?> create(@RequestAttribute("userId") Integer userId, @Valid @RequestBody CategoryReq request) {
        try {
            return message.getData("Kategori berhasil dibuat", categoryService.createCategory(userId, request), 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestAttribute("userId") Integer userId) {
        try {
            return message.getData("Berhasil mengambil data kategori", categoryService.getAllCategories(userId), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil detail kategori", categoryService.getCategoryById(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestAttribute("userId") Integer userId, @PathVariable Integer id, @Valid @RequestBody CategoryReq request) {
        try {
            return message.getData("Kategori berhasil diperbarui", categoryService.updateCategory(userId, id, request), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestAttribute("userId") Integer userId, @PathVariable Integer id) {
        try {
            categoryService.deleteCategory(userId, id);
            return message.success("Kategori berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
