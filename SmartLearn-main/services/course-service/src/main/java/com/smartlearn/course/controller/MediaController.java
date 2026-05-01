package com.smartlearn.course.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/media")
@Slf4j
public class MediaController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @Value("${app.upload.url-prefix:http://localhost:8080/api/courses/uploads/}")
    private String urlPrefix;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
        }

        try {
            // Clean paths and create directory if it doesn't exist
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                extension = originalFilename.substring(i);
            }

            // Generate unique file name
            String fileName = UUID.randomUUID() + extension;
            Path targetLocation = dirPath.resolve(fileName);
            
            // Copy file to the target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = urlPrefix + fileName;
            log.info("File uploaded successfully to: {}", targetLocation);

            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException ex) {
            log.error("Could not upload file", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not store file. Please try again!"));
        }
    }
}
