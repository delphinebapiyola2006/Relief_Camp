package com.reliefcamp.controller;

import com.reliefcamp.entity.Camp;
import com.reliefcamp.entity.Family;
import com.reliefcamp.entity.Supply;
import com.reliefcamp.service.CampService;
import com.reliefcamp.service.FamilyService;
import com.reliefcamp.service.SupplyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/camps")
public class CampController {

    private final CampService campService;
    private final SupplyService supplyService;
    private final FamilyService familyService;

    public CampController(
            CampService campService,
            SupplyService supplyService,
            FamilyService familyService) {

        this.campService = campService;
        this.supplyService = supplyService;
        this.familyService = familyService;
    }

    @PostMapping
    public Camp create(@RequestBody Camp camp) {
        return campService.save(camp);
    }

    @GetMapping
    public List<Camp> getAll() {
        return campService.getAll();
    }

    @GetMapping("/{id}")
    public Camp getById(@PathVariable Long id) {
        return campService.getById(id);
    }

    @GetMapping("/{id}/inventory")
    public List<Supply> getInventory(@PathVariable Long id) {
        return supplyService.getByCampId(id);
    }

    @GetMapping("/{id}/families")
    public List<Family> getFamilies(@PathVariable Long id) {
        return familyService.getByCampId(id);
    }
}