package com.example.finance_service.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.finance_service.payload.req.TagReq;
import com.example.finance_service.service.TagService;
import com.example.finance_service.utility.Message;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/tags")
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class TagController {

    @Autowired
    private TagService tagService;

    @Autowired
    private Message message;

    @PostMapping
    public ResponseEntity<?> createTag(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody TagReq request) {
        try {
            return message.getData("Tag berhasil dibuat", tagService.createTag(userId, request), 201);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTags(@RequestAttribute("userId") Integer userId) {
        try {
            return message.getData("Berhasil mengambil data tag", tagService.getTagsByUserId(userId), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 500);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTagById(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            return message.getData("Berhasil mengambil detail tag", tagService.getTagById(userId, id), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 404);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTag(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id,
            @Valid @RequestBody TagReq request) {
        try {
            return message.getData("Tag berhasil diperbarui", tagService.updateTag(userId, id, request), 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        try {
            tagService.deleteTag(userId, id);
            return message.success("Tag berhasil dihapus", 200);
        } catch (Exception e) {
            return message.badReq(e.getMessage(), 400);
        }
    }
}
