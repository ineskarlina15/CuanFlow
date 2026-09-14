package com.example.auth_service.utility;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class Message {
    public ResponseEntity<?> success(String message, int status) {
        Map<String, Object> res = new HashMap<>();
        res.put("message", message);
        res.put("status", status);
        return ResponseEntity.status(status).body(res);
    }

    public ResponseEntity<?> error(String message, int status) {
        Map<String, Object> res = new HashMap<>();
        res.put("message", message);
        res.put("status", status);
        return ResponseEntity.status(status).body(res);
    }

    public ResponseEntity<?> getData(String message, Object data, int status) {
        Map<String, Object> res = new HashMap<>();
        res.put("message", message);
        res.put("data", data);
        res.put("status", status);
        return ResponseEntity.status(status).body(res);
    }

    public ResponseEntity<?> badReq(String message, int status) {
        return error(message, status);
    }

}