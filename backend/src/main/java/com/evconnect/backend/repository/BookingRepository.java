package com.evconnect.backend.repository;

import com.evconnect.backend.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @EntityGraph(attributePaths = {"user", "station", "slot"})
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
    
    @EntityGraph(attributePaths = {"user", "station", "slot"})
    List<Booking> findByStationIdAndBookingDate(Long stationId, String bookingDate);
    
    @EntityGraph(attributePaths = {"user", "station", "slot"})
    Optional<Booking> findById(Long id);
}
