package com.example.finance_service.utility;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
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

    public ResponseEntity<?> accessDenied() {
        Map<String, Object> res = new HashMap<>();
        res.put("error", "access_denied");
        res.put("error_description", "Access is denied");
        return new ResponseEntity<>(res, HttpStatus.FORBIDDEN);
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

    public ResponseEntity<?> conflict(String message, int status) {
        Map<String, Object> res = new HashMap<>();
        res.put("message", message);
        res.put("status", status);
        return ResponseEntity.status(status).body(res);
    }

    public ResponseEntity<?> badReq(String message, int status) {
        Map<String, Object> res = new HashMap<>();
        res.put("message", message);
        res.put("status", status);
        return ResponseEntity.status(status).body(res);
    }


}
