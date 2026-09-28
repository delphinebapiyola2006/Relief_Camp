package com.reliefcamp.controller;

import com.reliefcamp.entity.Family;
import com.reliefcamp.service.FamilyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/families")
public class FamilyController {

    private final FamilyService service;

    public FamilyController(FamilyService service) {
        this.service = service;
    }

    @PostMapping
    public Family register(@RequestBody Family family) {
        return service.register(family);
    }
}