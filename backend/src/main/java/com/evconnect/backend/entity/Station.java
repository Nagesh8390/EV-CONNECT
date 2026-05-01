package com.evconnect.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double latitude;

    private Double longitude;

    private String address;

    @Column(name = "price_per_kwh")
    private Double pricePerKwh;

    @Column(name = "total_slots")
    private Integer totalSlots;

    public Station() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; }
    public Integer getTotalSlots() { return totalSlots; }
    public void setTotalSlots(Integer totalSlots) { this.totalSlots = totalSlots; }
}
