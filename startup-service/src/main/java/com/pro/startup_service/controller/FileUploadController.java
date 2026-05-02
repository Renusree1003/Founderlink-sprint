package com.pro.startup_service.controller;

import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pro.startup_service.entity.Startup;
import com.pro.startup_service.service.FileStorageService;
import com.pro.startup_service.service.StartupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/startups")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final StartupService startupService;

    /**
     * Upload or replace a startup logo (image file, max 2 MB).
     */
    @PostMapping("/{id}/logo")
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @PathVariable(name = "id") Long id,
            @RequestParam("file") MultipartFile file) {

        Startup startup = startupService.getById(id);
        String url = fileStorageService.storeLogo(file, id);
        startup.setLogoUrl(url);
        startupService.saveEntity(startup);

        return ResponseEntity.ok(Map.of("logoUrl", url));
    }

    /**
     * Upload or replace a pitch deck (PDF only, max 10 MB).
     */
    @PostMapping("/{id}/pitch-deck")
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public ResponseEntity<Map<String, String>> uploadPitchDeck(
            @PathVariable(name = "id") Long id,
            @RequestParam("file") MultipartFile file) {

        Startup startup = startupService.getById(id);
        String url = fileStorageService.storePitchDeck(file, id);
        startup.setPitchDeckUrl(url);
        startupService.saveEntity(startup);

        return ResponseEntity.ok(Map.of("pitchDeckUrl", url));
    }

    /**
     * Serve an uploaded file (logo or pitch deck).
     * This endpoint is publicly accessible so images render in img tags.
     * @param type "logos" or "pitchdecks"
     */
    @GetMapping("/files/{type}/{filename}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "filename") String filename) {

        Resource resource = fileStorageService.loadFile(type, filename);

        String contentType = "application/octet-stream";
        if (filename.endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (filename.endsWith(".png")) {
            contentType = "image/png";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (filename.endsWith(".gif")) {
            contentType = "image/gif";
        } else if (filename.endsWith(".webp")) {
            contentType = "image/webp";
        } else if (filename.endsWith(".svg")) {
            contentType = "image/svg+xml";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        type.equals("pitchdecks")
                                ? "attachment; filename=\"" + filename + "\""
                                : "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
