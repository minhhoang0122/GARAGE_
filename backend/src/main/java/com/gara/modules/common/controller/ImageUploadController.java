package com.gara.modules.common.controller;

import com.gara.modules.common.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageUploadController {

    private final ImageService imageService;

    public ImageUploadController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "receptions") String folder) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chọn file để upload");
        }

        try {
            String imageUrl = imageService.uploadImage(file, folder);
            return ResponseEntity.ok(Map.of("url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }
}
