package com.reliefcamp.service;

import com.reliefcamp.entity.Camp;
import com.reliefcamp.entity.Family;
import com.reliefcamp.repository.CampRepository;
import com.reliefcamp.repository.FamilyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final CampRepository campRepository;

    public FamilyService(
            FamilyRepository familyRepository,
            CampRepository campRepository) {
        this.familyRepository = familyRepository;
        this.campRepository = campRepository;
    }

    public Family register(Family family) {

        Camp camp = campRepository.findById(family.getCamp().getId())
                .orElseThrow(() -> new RuntimeException("Camp not found"));

        if (camp.getCurrentOccupancy() + family.getHeadcount()
                > camp.getCapacity()) {

            throw new RuntimeException("Camp capacity exceeded");
        }

        family.setCamp(camp);

        camp.setCurrentOccupancy(
                camp.getCurrentOccupancy() + family.getHeadcount()
        );

        campRepository.save(camp);

        return familyRepository.save(family);
    }

    public List<Family> getByCampId(Long campId) {
        return familyRepository.findByCampId(campId);
    }
}