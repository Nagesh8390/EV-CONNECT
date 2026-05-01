package com.evconnect.backend.service;

import com.evconnect.backend.entity.Station;
import com.evconnect.backend.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StationService {

    @Autowired
    private StationRepository stationRepository;

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }

    public Station addStation(Station station) {
        return stationRepository.save(station);
    }

    public void removeStation(Long id) {
        stationRepository.deleteById(id);
    }

    public Station updateStation(Long id, Station updated) {
        Station existing = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setPricePerKwh(updated.getPricePerKwh());
        existing.setTotalSlots(updated.getTotalSlots());
        return stationRepository.save(existing);
    }
}
