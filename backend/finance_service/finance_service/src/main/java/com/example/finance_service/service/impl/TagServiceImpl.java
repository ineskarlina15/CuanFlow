package com.example.finance_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finance_service.entity.Tag;
import com.example.finance_service.payload.req.TagReq;
import com.example.finance_service.repository.TagRepository;
import com.example.finance_service.service.TagService;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    @Override
    public Tag createTag(Integer userId, TagReq request) throws Exception {
        Tag tag = new Tag();
        tag.setUserId(userId);
        tag.setName(request.getName());
        return tagRepository.save(tag);
    }

    @Override
    public List<Tag> getTagsByUserId(Integer userId) {
        return tagRepository.findByUserId(userId);
    }

    @Override
    public Tag getTagById(Integer userId, Integer tagId) throws Exception {
        return tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new Exception("Tag tidak ditemukan"));
    }

    @Override
    public Tag updateTag(Integer userId, Integer tagId, TagReq request) throws Exception {
        Tag tag = getTagById(userId, tagId);
        tag.setName(request.getName());
        return tagRepository.save(tag);
    }

    @Override
    public void deleteTag(Integer userId, Integer tagId) throws Exception {
        Tag tag = getTagById(userId, tagId);
        tagRepository.delete(tag);
    }
}
