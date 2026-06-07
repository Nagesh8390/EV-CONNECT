package com.evconnect.backend.service;

import com.brevo.ApiClient;
import com.brevo.ApiException;
import com.brevo.Configuration;
import com.brevo.auth.ApiKeyAuth;
import com.brevo.model.SendSmtpEmail;
import com.brevo.model.SendSmtpEmailSender;
import com.brevo.model.SendSmtpEmailTo;
import com.evconnect.backend.entity.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Collections;

@Service
public class EmailService {

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    @Async("emailExecutor")
    public void sendBookingConfirmation(Booking booking) {
        System.out.println("📧 Starting email send process (async via Brevo API)...");

        if (booking.getUser() == null || booking.getUser().getEmail() == null) {
            System.out.println("⚠️ No user or user email found, skipping email.");
            return;
        }

        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            System.out.println("⚠️ BREVO_API_KEY not set, skipping email.");
            return;
        }

        try {
            String to = booking.getUser().getEmail();
            String name = booking.getUser().getName() != null ? booking.getUser().getName() : "Valued Customer";
            String otp = booking.getOtp();
            String station = booking.getStation() != null ? booking.getStation().getName() : "EV Station";
            String slotTime = booking.getSlot() != null ? booking.getSlot().getSlotTime() : "–";
            String date = booking.getBookingDate() != null
                    ? booking.getBookingDate()
                    : (booking.getCreatedAt() != null ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) : "–");

            System.out.println("📧 Preparing email to: " + to);

            ApiClient defaultClient = Configuration.getDefaultApiClient();
            defaultClient.setBasePath("https://api.brevo.com/v3");
            ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
            apiKey.setApiKey(brevoApiKey);

            com.brevo.api.TransactionalEmailsApi apiInstance = new com.brevo.api.TransactionalEmailsApi(defaultClient);

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setName("EV CONNECT");
            sender.setEmail("evconnect.service@gmail.com");
            sendSmtpEmail.setSender(sender);

            SendSmtpEmailTo toObj = new SendSmtpEmailTo();
            toObj.setEmail(to);
            toObj.setName(name);
            sendSmtpEmail.setTo(Collections.singletonList(toObj));

            sendSmtpEmail.setSubject("⚡ EV CONNECT - Your Booking OTP & Confirmation");

            String htmlContent = buildEmailHtml(name, otp, station, slotTime, date);
            sendSmtpEmail.setHtmlContent(htmlContent);

            System.out.println("📧 Sending email via Brevo API...");
            Object result = apiInstance.sendTransacEmail(sendSmtpEmail);
            System.out.println("✅ Booking confirmation email sent to: " + to);
            System.out.println("📧 Brevo response: " + result);

        } catch (ApiException e) {
            System.err.println("❌ Brevo API Exception: " + e.getMessage());
            System.err.println("❌ Response Body: " + e.getResponseBody());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking email: " + e.getMessage());
            e.printStackTrace();
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
                        <h1>EV CONNECT</h1>
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
                        <p>Thank you for choosing EV CONNECT.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 EV CONNECT. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
