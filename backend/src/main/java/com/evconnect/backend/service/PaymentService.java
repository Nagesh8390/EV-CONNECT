package com.evconnect.backend.service;

import com.evconnect.backend.entity.Booking;
import com.evconnect.backend.entity.Payment;
import com.evconnect.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EmailService emailService;

    public Payment processFakePayment(Long bookingId, Double amount) {
        Booking booking = bookingService.getBookingById(bookingId);

        // Simulate payment processing
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setStatus("PENDING"); // Will become SUCCESS only after admin OTP verification
        payment.setPaymentMethod("SIMULATED_CARD");
        payment.setTransactionId("EV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        paymentRepository.save(payment);

        // Slot status is no longer globally updated to BOOKED
        // Date-specific availability is now checked in BookingService and frontend.

        // Trigger email notification AFTER successful payment
        emailService.sendBookingConfirmation(booking);

        return payment;
    }
}
