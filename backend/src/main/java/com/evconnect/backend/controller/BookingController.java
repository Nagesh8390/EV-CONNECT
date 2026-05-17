package com.evconnect.backend.controller;

import com.evconnect.backend.dto.BookingRequest;
import com.evconnect.backend.entity.Booking;
import com.evconnect.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/bookSlot")
    public ResponseEntity<?> bookSlot(@RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.bookSlot(request.getUserId(), request.getStationId(), request.getSlotId(), request.getSlotTime(), request.getBookingDate());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/station/{stationId}/date/{date}")
    public List<Booking> getBookingsForStationAndDate(@PathVariable Long stationId, @PathVariable String date) {
        return bookingService.getBookingsByStationAndDate(stationId, date);
    }

    @GetMapping("/admin")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/{id}/verify-otp")
    public ResponseEntity<?> verifyAdminOtp(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            boolean success = bookingService.verifyOtpAndUpdatePayment(id, payload.get("otp"));
            if (success) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "OTP Verified"));
            } else {
                return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Invalid or Expired OTP"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/payment-status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(java.util.Collections.singletonMap("status", bookingService.getPaymentStatus(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }
}
