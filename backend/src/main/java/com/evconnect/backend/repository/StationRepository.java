package com.evconnect.backend.repository;

import com.evconnect.backend.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, Long> {
}
