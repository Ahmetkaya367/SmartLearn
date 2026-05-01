package com.smartlearn.course.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses/uploads")
@Slf4j
public class VideoStreamingController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @GetMapping(value = "/{fileName}", produces = "video/mp4")
    public ResponseEntity<ResourceRegion> streamVideo(
            @PathVariable String fileName,
            @RequestHeader HttpHeaders headers) throws IOException {

        Path filePath = Paths.get(uploadDir).resolve(fileName);
        Resource video = new FileSystemResource(filePath);

        if (!video.exists()) {
            return ResponseEntity.notFound().build();
        }

        ResourceRegion region = resourceRegion(video, headers);
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(MediaTypeFactory.getMediaType(video).orElse(MediaType.valueOf("video/mp4")))
                .body(region);
    }

    private ResourceRegion resourceRegion(Resource video, HttpHeaders headers) throws IOException {
        long contentLength = video.contentLength();
        Optional<HttpRange> range = headers.getRange().stream().findFirst();
        
        if (range.isPresent()) {
            long start = range.get().getRangeStart(contentLength);
            long end = range.get().getRangeEnd(contentLength);
            long rangeLength = Math.min(1024 * 1024, end - start + 1); // 1MB chunks
            return new ResourceRegion(video, start, rangeLength);
        } else {
            long rangeLength = Math.min(1024 * 1024, contentLength);
            return new ResourceRegion(video, 0, rangeLength);
        }
    }
}
