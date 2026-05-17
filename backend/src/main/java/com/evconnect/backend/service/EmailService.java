package com.evconnect.backend.service;

import com.evconnect.backend.entity.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a booking confirmation email with OTP to the user.
     * Runs asynchronously so it never blocks the booking API response.
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (booking.getUser() == null || booking.getUser().getEmail() == null) return;

        try {
            String to      = booking.getUser().getEmail();
            String name    = booking.getUser().getName() != null ? booking.getUser().getName() : "Valued Customer";
            String otp     = booking.getOtp();
            String station = booking.getStation() != null ? booking.getStation().getName() : "EV Station";
            String slotTime = booking.getSlot() != null ? booking.getSlot().getSlotTime() : "–";
            String date     = booking.getBookingDate() != null 
                    ? booking.getBookingDate() 
                    : (booking.getCreatedAt() != null ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) : "–");

            String subject = "⚡ EV Connect — Your Booking OTP & Confirmation";
            String html    = buildEmailHtml(name, otp, station, slotTime, date);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "EV Connect");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true); // true = isHtml

            mailSender.send(message);
            System.out.println("✅ Booking confirmation email sent to: " + to);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            // Never crash the booking flow if email fails
            System.err.println("⚠️ Failed to send booking email: " + e.getMessage());
        }
    }

    private String buildEmailHtml(String name, String otp, String station, String slotTime, String date) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 4px; background-color: #fff; }
                    .header { border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { margin: 0; color: #0056b3; font-size: 24px; }
                    .content p { margin: 0 0 15px 0; }
                    .otp-box { background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; text-align: center; margin-bottom: 20px; border-radius: 4px; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
                    th { font-weight: bold; color: #555; width: 30%; }
                    .footer { font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>EV Connect</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>""" + name + """
                        </strong>,</p>
                        <p>Your EV charging slot booking has been confirmed successfully.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #555;">Your Charging Session OTP</p>
                            <div class="otp-code">""" + otp + """
                            </div>
                            <p style="margin: 0; font-size: 13px; color: #777;">Please enter this OTP at the station. Valid for 24 hours.</p>
                        </div>
                        
                        <p><strong>Booking Details:</strong></p>
                        <table>
                            <tr>
                                <th>Station</th>
                                <td>""" + station + """
                                </td>
                            </tr>
                            <tr>
                                <th>Date & Time</th>
                                <td>""" + date + """
                                </td>
                            </tr>
                            <tr>
                                <th>Time Slot</th>
                                <td>""" + slotTime + """
                                </td>
                            </tr>
                        </table>
                        
                        <p>If you have any questions, please contact our support team at support@evconnect.in.</p>
                        <p>Thank you for choosing EV Connect.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 EV Connect. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
