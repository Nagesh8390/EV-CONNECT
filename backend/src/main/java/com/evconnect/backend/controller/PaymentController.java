package com.evconnect.backend.controller;

import com.evconnect.backend.dto.PaymentRequest;
import com.evconnect.backend.entity.Payment;
import com.evconnect.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/fakePayment")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        try {
            Payment payment = paymentService.processFakePayment(request.getBookingId(), request.getAmount());
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
