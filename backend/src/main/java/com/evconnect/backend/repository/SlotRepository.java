package com.evconnect.backend.repository;

import com.evconnect.backend.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByStationId(Long stationId);
    List<Slot> findByStationIdAndStatus(Long stationId, String status);
    List<Slot> findByStationIdAndSlotTime(Long stationId, String slotTime);
}
