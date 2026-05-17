package com.evconnect.backend.repository;

import com.evconnect.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    boolean existsByStationIdAndBookingDateAndTimeSlot(Long stationId, String bookingDate, String timeSlot);
    
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
           "FROM Booking b " +
           "WHERE b.station.id = :stationId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.timeSlot = :timeSlot " +
           "AND b.id != :excludeId")
    boolean existsByStationIdAndBookingDateAndTimeSlotExcludingId(
            @Param("stationId") Long stationId,
            @Param("bookingDate") String bookingDate,
            @Param("timeSlot") String timeSlot,
            @Param("excludeId") Long excludeId
    );
    
    List<Booking> findByStationIdAndBookingDate(Long stationId, String bookingDate);
}
