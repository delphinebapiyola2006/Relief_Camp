package com.reliefcamp.service;

import com.reliefcamp.entity.Supply;
import com.reliefcamp.repository.SupplyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplyService {

    private final SupplyRepository repository;

    public SupplyService(SupplyRepository repository) {
        this.repository = repository;
    }

    public Supply save(Supply supply) {
        return repository.save(supply);
    }

    public List<Supply> getByCampId(Long campId) {
        return repository.findByCampId(campId);
    }
}