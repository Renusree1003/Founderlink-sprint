package com.pro.startup_service.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );
    private static final String ALLOWED_DECK_TYPE = "application/pdf";
    private static final long MAX_LOGO_SIZE = 2 * 1024 * 1024;       // 2 MB
    private static final long MAX_PITCH_DECK_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Path logosDir;
    private final Path pitchDecksDir;

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.logosDir = Paths.get(uploadDir, "logos").toAbsolutePath().normalize();
        this.pitchDecksDir = Paths.get(uploadDir, "pitchdecks").toAbsolutePath().normalize();
        try {
            Files.createDirectories(logosDir);
            Files.createDirectories(pitchDecksDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    /**
     * Store a startup logo image. Replaces any existing logo for the given startup.
     * @return the relative URL path to access the file, e.g. "logos/5_abc123.png"
     */
    public String storeLogo(MultipartFile file, Long startupId) {
        validateFile(file, ALLOWED_IMAGE_TYPES, MAX_LOGO_SIZE, "logo image");
        deleteExistingFiles(logosDir, startupId);
        String filename = buildFilename(startupId, file.getOriginalFilename());
        saveFile(file, logosDir.resolve(filename));
        log.info("Stored logo for startup {} -> {}", startupId, filename);
        return "logos/" + filename;
    }

    /**
     * Store a pitch deck PDF. Replaces any existing pitch deck for the given startup.
     * @return the relative URL path to access the file, e.g. "pitchdecks/5_abc123.pdf"
     */
    public String storePitchDeck(MultipartFile file, Long startupId) {
        validateFile(file, Set.of(ALLOWED_DECK_TYPE), MAX_PITCH_DECK_SIZE, "PDF pitch deck");
        deleteExistingFiles(pitchDecksDir, startupId);
        String filename = buildFilename(startupId, file.getOriginalFilename());
        saveFile(file, pitchDecksDir.resolve(filename));
        log.info("Stored pitch deck for startup {} -> {}", startupId, filename);
        return "pitchdecks/" + filename;
    }

    /**
     * Load a file as a Resource for serving via HTTP.
     * @param type "logos" or "pitchdecks"
     */
    public Resource loadFile(String type, String filename) {
        try {
            Path dir = "logos".equals(type) ? logosDir : pitchDecksDir;
            Path filePath = dir.resolve(filename).normalize();
            // Prevent path traversal
            if (!filePath.startsWith(dir)) {
                throw new RuntimeException("Invalid file path");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + filename);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    // ── Private helpers ──

    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSize, String label) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Invalid file type for " + label + ". Allowed: " + allowedTypes);
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(
                    label + " exceeds maximum size of " + (maxSize / (1024 * 1024)) + " MB");
        }
    }

    private String buildFilename(Long startupId, String originalFilename) {
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        return startupId + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
    }

    /** Delete any files belonging to this startup (matched by prefix "startupId_"). */
    private void deleteExistingFiles(Path dir, Long startupId) {
        try {
            String prefix = startupId + "_";
            Files.list(dir)
                    .filter(p -> p.getFileName().toString().startsWith(prefix))
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                            log.debug("Deleted old file: {}", p);
                        } catch (IOException e) {
                            log.warn("Could not delete old file: {}", p, e);
                        }
                    });
        } catch (IOException e) {
            log.warn("Could not list files in {} for cleanup", dir, e);
        }
    }

    private void saveFile(MultipartFile file, Path target) {
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
