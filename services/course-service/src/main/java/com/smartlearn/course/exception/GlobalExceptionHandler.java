package com.smartlearn.course.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Internal Server Error: " + e.getMessage());
        body.put("type", e.getClass().getSimpleName());
        
        // Bu yardımıyla tam olarak nerede hata olduğunu görebileceğiz
        StackTraceElement[] stackTrace = e.getStackTrace();
        if (stackTrace.length > 0) {
            body.put("location", stackTrace[0].toString());
        }
        
        e.printStackTrace(); // Loglara da yazsın
        return ResponseEntity.internalServerError().body(body);
    }
}
