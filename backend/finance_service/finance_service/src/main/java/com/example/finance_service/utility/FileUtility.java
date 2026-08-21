package com.example.finance_service.utility;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUtility {
    private final String UPLOAD_DIR = "uploads/attachments/";

    public String saveFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new Exception("File tidak boleh kosong");
        }

        // Validasi tipe file (Sesuai syarat S1: JPG, PNG, PDF)
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || 
                                     contentType.equals("image/png") || 
                                     contentType.equals("application/pdf"))) {
            throw new Exception("Format file tidak didukung. Harap unggah JPG, PNG, atau PDF.");
        }

        // Validasi ukuran file (misal maksimal 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new Exception("Ukuran file maksimal 5MB.");
        }

        // Membuat folder jika belum ada
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Membuat nama file unik agar tidak bentrok
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String newFileName = UUID.randomUUID().toString() + fileExtension;

        // Proses simpan file fisik
        Path filePath = Paths.get(UPLOAD_DIR + newFileName);
        Files.copy(file.getInputStream(), filePath);

        // Mengembalikan URL/Path untuk disimpan ke database
        return UPLOAD_DIR + newFileName;
    }
}
