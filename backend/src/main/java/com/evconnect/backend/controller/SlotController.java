package com.evconnect.backend.controller;

import com.evconnect.backend.entity.Slot;
import com.evconnect.backend.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations/{stationId}/slots")
@CrossOrigin(origins = "*")
public class SlotController {

    @Autowired
    private SlotService slotService;

    @GetMapping
    public List<Slot> getSlotsByStation(@PathVariable Long stationId) {
        return slotService.getSlotsByStation(stationId);
    }

    @Autowired
    private com.evconnect.backend.service.StationService stationService;

    @PostMapping("/admin")
    public ResponseEntity<?> createSlot(@PathVariable Long stationId, @RequestBody Slot slot) {
        return stationService.getStationById(stationId).map(station -> {
            slot.setStation(station);
            Slot createdSlot = slotService.createSlot(slot);
            return ResponseEntity.ok(createdSlot);
        }).orElse(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/admin/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long stationId, @PathVariable Long slotId) {
        try {
            slotService.deleteSlot(slotId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/{slotId}/status")
    public ResponseEntity<?> updateSlotStatus(@PathVariable Long stationId, @PathVariable Long slotId,
                                              @RequestParam String status) {
        try {
            Slot updated = slotService.updateSlotStatus(slotId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
