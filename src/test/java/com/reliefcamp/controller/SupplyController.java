package com.reliefcamp.controller;

import com.reliefcamp.entity.Supply;
import com.reliefcamp.service.SupplyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supplies")
public class SupplyController {

    private final SupplyService service;

    public SupplyController(SupplyService service) {
        this.service = service;
    }

    @PostMapping
    public Supply add(@RequestBody Supply supply) {
        return service.save(supply);
    }
}