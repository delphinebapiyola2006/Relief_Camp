package com.reliefcamp.controller;

import com.reliefcamp.entity.Distribution;
import com.reliefcamp.service.DistributionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/distributions")
public class DistributionController {

    private final DistributionService service;

    public DistributionController(DistributionService service) {
        this.service = service;
    }

    @PostMapping
    public Distribution distribute(@RequestBody Distribution distribution) {
        return service.distribute(distribution);
    }
}