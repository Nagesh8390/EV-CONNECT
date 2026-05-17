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
        System.out.println("💳 Processing payment for booking ID: " + bookingId);
        Booking booking = bookingService.getBookingById(bookingId);

        // Simulate payment processing
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setStatus("PENDING"); // Will become SUCCESS only after admin OTP verification
        payment.setPaymentMethod("SIMULATED_CARD");
        payment.setTransactionId("EV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        paymentRepository.save(payment);
        System.out.println("✅ Payment saved successfully for booking ID: " + bookingId);

        return payment;
    }
}
