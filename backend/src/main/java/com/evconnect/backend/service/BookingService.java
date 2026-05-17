package com.evconnect.backend.service;

import com.evconnect.backend.entity.Booking;
import com.evconnect.backend.entity.Slot;
import com.evconnect.backend.entity.Station;
import com.evconnect.backend.entity.User;
import com.evconnect.backend.repository.BookingRepository;
import com.evconnect.backend.repository.SlotRepository;
import com.evconnect.backend.repository.UserRepository;
import com.evconnect.backend.repository.PaymentRepository;
import com.evconnect.backend.entity.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StationService stationService;

    @Autowired
    private PaymentRepository paymentRepository;

    public synchronized Booking bookSlot(Long userId, Long stationId, Long slotId, String slotTime, String bookingDate) {
        // 🔒 Auth guard — userId must be present and must exist in the database
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Authentication required: please login before making a booking.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authentication required: user not found. Please login again."));
        Station station = stationService.getStationById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        Slot slot = null;
        if (slotId != null) {
            slot = slotRepository.findById(slotId).orElse(null);
        }

        // Validate that this exact date and time slot isn't already booked
        if (bookingRepository.existsByStationIdAndBookingDateAndTimeSlot(stationId, bookingDate, slotTime)) {
            throw new IllegalArgumentException("Slot is already booked for this date!");
        }

        if (slot == null && slotTime != null && !slotTime.isEmpty()) {
            // Check if a slot for this time already exists for this station
            List<Slot> existingSlots = slotRepository.findByStationIdAndSlotTime(stationId, slotTime);
            if (!existingSlots.isEmpty()) {
                slot = existingSlots.get(0);
            }
        }

        if (slot == null) {
            // Auto-generate a new slot if ID is not provided or not found, and no slot exists for this time
            slot = new Slot();
            slot.setStation(station);
            slot.setSlotTime(slotTime != null && !slotTime.isEmpty() ? slotTime : "Standard Slot");
            slot.setStatus("AVAILABLE");
            slot = slotRepository.save(slot);
        } else if (slotTime != null && !slotTime.isEmpty()) {
            slot.setSlotTime(slotTime);
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStation(station);
        booking.setSlot(slot);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setBookingDate(bookingDate);
        booking.setTimeSlot(slotTime);
        booking.setOtp(otp);
        booking.setOtpExpiry(LocalDateTime.now().plusHours(24));

        Booking savedBooking = bookingRepository.save(booking);

        return savedBooking;
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getBookingsByStationAndDate(Long stationId, String bookingDate) {
        return bookingRepository.findByStationIdAndBookingDate(stationId, bookingDate);
    }
    
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public void cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        // Free up the slot
        Slot slot = booking.getSlot();
        if (slot != null) {
            slot.setStatus("AVAILABLE");
            slotRepository.save(slot);
        }
        bookingRepository.deleteById(id);
    }

    public boolean verifyOtpAndUpdatePayment(Long bookingId, String enteredOtp) {
        Booking booking = getBookingById(bookingId);
        if (booking.getOtp() == null || booking.getOtpExpiry() == null) return false;
        
        if (booking.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }
        
        if (booking.getOtp().equals(enteredOtp)) {
            // Update existing payment to SUCCESS, or CREATE one if it doesn't exist
            java.util.Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setStatus("SUCCESS");
                paymentRepository.save(payment);
            } else {
                // No payment record yet — create one so frontend polling can detect SUCCESS
                Payment newPayment = new Payment();
                newPayment.setBooking(booking);
                newPayment.setAmount(0.0);
                newPayment.setStatus("SUCCESS");
                newPayment.setPaymentMethod("ADMIN_VERIFIED");
                newPayment.setTransactionId("EV-ADMIN-" + bookingId);
                paymentRepository.save(newPayment);
            }
            // Clear OTP to prevent reuse
            booking.setOtp(null);
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }

    public String getPaymentStatus(Long bookingId) {
        java.util.Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
        return paymentOpt.isPresent() ? paymentOpt.get().getStatus() : "PENDING";
    }
}
