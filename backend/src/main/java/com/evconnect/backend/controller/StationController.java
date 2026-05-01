package com.evconnect.backend.controller;

import com.evconnect.backend.entity.Station;
import com.evconnect.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    @Autowired
    private StationService stationService;

    @GetMapping
    public List<Station> getAllStations() {
        return stationService.getAllStations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable Long id) {
        return stationService.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    public Station addStation(@RequestBody Station station) {
        return stationService.addStation(station);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> removeStation(@PathVariable Long id) {
        stationService.removeStation(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateStation(@PathVariable Long id, @RequestBody Station station) {
        try {
            Station updated = stationService.updateStation(id, station);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
