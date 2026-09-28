package com.reliefcamp.repository;

import com.reliefcamp.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamilyRepository extends JpaRepository<Family, Long> {

    List<Family> findByCampId(Long campId);
}