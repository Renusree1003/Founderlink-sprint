package com.pro.startup_service.controller;



import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.pro.startup_service.entity.Startup;
import com.pro.startup_service.service.StartupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService service;

    @PostMapping
    public Startup create(@RequestBody Startup startup) {
        return service.create(startup);
    }

    @GetMapping
    public List<Startup> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Startup getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Startup update(@PathVariable Long id, @RequestBody Startup startup) {
        return service.update(id, startup);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }

    @GetMapping("/search")
    public List<Startup> search(@RequestParam String keyword) {
        return service.search(keyword);
    }
}
