package com.pro.startup_service.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pro.startup_service.entity.Startup;
import com.pro.startup_service.service.StartupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService service;

    // CREATE
    @PostMapping
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public Startup create(@RequestBody Startup s) {
        return service.create(s);
    }

    // GET ALL (with Search, Filter, Pagination)
    @GetMapping
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','COFOUNDER','ADMIN')")
    public ResponseEntity<Page<Startup>> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String domain,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(service.getAll(query, domain, pageable));
    }

    // GET BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','INVESTOR','COFOUNDER','ADMIN')")
    public Startup getById(@PathVariable(name = "id") Long id) {
        return service.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public Startup update(@PathVariable(name = "id") Long id, @RequestBody Startup s) {
        return service.update(id, s);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public void delete(@PathVariable(name = "id") Long id) {
        service.delete(id);
    }
}