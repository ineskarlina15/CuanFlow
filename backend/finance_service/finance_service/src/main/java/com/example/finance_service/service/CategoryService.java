package com.example.finance_service.service;

import java.util.List;

import com.example.finance_service.entity.Category;
import com.example.finance_service.payload.req.CategoryReq;

public interface CategoryService {
    Category createCategory(Integer userId, CategoryReq request) throws Exception;
    List<Category> getAllCategories(Integer userId);
    Category getCategoryById(Integer userId, Integer id) throws Exception;
    Category updateCategory(Integer userId, Integer id, CategoryReq request) throws Exception;
    void deleteCategory(Integer userId, Integer id) throws Exception;
}
