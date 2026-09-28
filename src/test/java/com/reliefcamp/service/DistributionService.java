package com.reliefcamp.service;

import com.reliefcamp.entity.Distribution;
import com.reliefcamp.entity.Supply;
import com.reliefcamp.repository.DistributionRepository;
import com.reliefcamp.repository.SupplyRepository;
import org.springframework.stereotype.Service;

@Service
public class DistributionService {

    private final DistributionRepository distributionRepository;
    private final SupplyRepository supplyRepository;

    public DistributionService(DistributionRepository distributionRepository,
                               SupplyRepository supplyRepository) {
        this.distributionRepository = distributionRepository;
        this.supplyRepository = supplyRepository;
    }

    public Distribution distribute(Distribution distribution) {

        Supply supply = supplyRepository.findById(
                distribution.getSupply().getId()
        ).orElseThrow(() -> new RuntimeException("Supply not found"));

        if (distribution.getQuantity() > supply.getQuantity()) {
            throw new RuntimeException("Insufficient supply");
        }

        supply.setQuantity(
                supply.getQuantity() - distribution.getQuantity()
        );

        supplyRepository.save(supply);

        distribution.setSupply(supply);

        return distributionRepository.save(distribution);
    }
}