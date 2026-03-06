package com.gara.modules.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImageService {

    private final Cloudinary cloudinary;

    public ImageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload an image to Cloudinary
     * 
     * @param file   the MultipartFile to upload
     * @param folder the folder on Cloudinary where to store the image
     * @return the secure URL of the uploaded image
     * @throws IOException if there's an error during upload
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> uploadParams = Map.of(
                "folder", folder,
                "resource_type", "auto");

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        return uploadResult.get("secure_url").toString();
    }

    /**
     * Delete an image from Cloudinary using its secure URL or public ID
     * (Simplified: This would typically need the public ID)
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
