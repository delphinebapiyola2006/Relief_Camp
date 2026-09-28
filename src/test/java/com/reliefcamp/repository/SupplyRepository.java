package com.reliefcamp.repository;

import com.reliefcamp.entity.Supply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplyRepository extends JpaRepository<Supply, Long> {

    List<Supply> findByCampId(Long campId);
}