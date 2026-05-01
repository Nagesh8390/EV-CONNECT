package com.evconnect.backend.repository;

import com.evconnect.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    boolean existsByStationIdAndBookingDateAndTimeSlot(Long stationId, String bookingDate, String timeSlot);
    List<Booking> findByStationIdAndBookingDate(Long stationId, String bookingDate);
}
