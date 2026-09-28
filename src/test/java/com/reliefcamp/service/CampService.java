package com.reliefcamp.service;

import com.reliefcamp.entity.Camp;
import com.reliefcamp.repository.CampRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampService {

    private final CampRepository repository;

    public CampService(CampRepository repository) {
        this.repository = repository;
    }

    public Camp save(Camp camp) {
        camp.setId(null);
        camp.setCurrentOccupancy(0);
        return repository.save(camp);
    }

    public List<Camp> getAll() {
        return repository.findAll();
    }

    public Camp getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camp not found"));
    }
}