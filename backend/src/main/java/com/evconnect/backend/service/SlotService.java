package com.evconnect.backend.service;

import com.evconnect.backend.entity.Slot;
import com.evconnect.backend.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    public List<Slot> getSlotsByStation(Long stationId) {
        return slotRepository.findByStationId(stationId);
    }

    public Slot createSlot(Slot slot) {
        return slotRepository.save(slot);
    }

    public Slot updateSlotStatus(Long slotId, String status) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        slot.setStatus(status);
        return slotRepository.save(slot);
    }

    public void deleteSlot(Long slotId) {
        if (!slotRepository.existsById(slotId)) {
            throw new RuntimeException("Slot not found: " + slotId);
        }
        slotRepository.deleteById(slotId);
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }
}
