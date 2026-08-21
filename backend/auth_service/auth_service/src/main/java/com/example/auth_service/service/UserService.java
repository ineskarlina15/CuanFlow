package com.example.auth_service.service;

import com.example.auth_service.payload.req.UpdateProfileReq;
import com.example.auth_service.payload.res.ProfileRes;

public interface UserService {
    ProfileRes getMyProfile(String email) throws Exception;
    ProfileRes updateMyProfile(String email, UpdateProfileReq request) throws Exception;
    java.util.List<com.example.auth_service.entity.User> getAllUsers();
}
