package com.example.auth_service.service;

import com.example.auth_service.payload.req.UpdateProfileReq;
import com.example.auth_service.payload.res.ProfileRes;
import java.util.List;

public interface UserService {
    ProfileRes getMyProfile(String email) throws Exception;
    ProfileRes updateMyProfile(String email, UpdateProfileReq request) throws Exception;
    List<ProfileRes> getAllUsers();
    ProfileRes updateUserRole(Integer targetUserId, String role) throws Exception;
    ProfileRes toggleUserStatus(Integer targetUserId) throws Exception;
    void deleteUser(Integer targetUserId) throws Exception;
}
