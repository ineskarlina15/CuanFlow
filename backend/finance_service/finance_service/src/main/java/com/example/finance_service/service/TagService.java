package com.example.finance_service.service;

import java.util.List;

import com.example.finance_service.entity.Tag;
import com.example.finance_service.payload.req.TagReq;

public interface TagService {
    Tag createTag(Integer userId, TagReq request) throws Exception;
    List<Tag> getTagsByUserId(Integer userId);
    Tag getTagById(Integer userId, Integer tagId) throws Exception;
    Tag updateTag(Integer userId, Integer tagId, TagReq request) throws Exception;
    void deleteTag(Integer userId, Integer tagId) throws Exception;
}
