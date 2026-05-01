package com.evconnect.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "slots")
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Station station;

    @Column(name = "slot_time")
    private String slotTime; // e.g., "09:00-10:00"

    private String status; // "AVAILABLE", "BOOKED", "RESERVED"

    public Slot() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Station getStation() { return station; }
    public void setStation(Station station) { this.station = station; }
    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
