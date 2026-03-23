package com.pro.startup_service.service;



import java.util.List;

import org.springframework.stereotype.Service;

import com.pro.startup_service.entity.Startup;
import com.pro.startup_service.repository.StartupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository repository;

    public Startup create(Startup startup) {
        return repository.save(startup);
    }

    public List<Startup> getAll() {
        return repository.findAll();
    }

    public Startup getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    public Startup update(Long id, Startup updated) {
        Startup existing = getById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setDomain(updated.getDomain());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Startup> search(String keyword) {
        return repository.findByTitleContainingIgnoreCase(keyword);
    }
}