package com.gara.modules.support.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.gara.entity.RepairOrder;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:noreply@letanlex.id.vn}")
    private String fromEmail;

    private final SystemConfigService systemConfigService;

    public EmailService(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @org.springframework.scheduling.annotation.Async
    public void sendText(String to, String subject, String body) {
        sendViaResend(to, subject, body, false);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendHtml(String to, String subject, String htmlContent) {
        sendViaResend(to, subject, htmlContent, true);
    }

    private void sendViaResend(String to, String subject, String content, boolean isHtml) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.warn("Resend API Key is not configured. Email not sent to {}", to);
            return;
        }

        logger.info("Sending email via Resend - To: {}, Subject: {}", to, subject);

        Resend resend = new Resend(resendApiKey);

        CreateEmailOptions.Builder requestBuilder = CreateEmailOptions.builder()
                .from("AutoCare <" + fromEmail + ">")
                .to(to)
                .subject(subject);

        if (isHtml) {
            requestBuilder.html(content);
        } else {
            requestBuilder.text(content);
        }

        try {
            CreateEmailResponse response = resend.emails().send(requestBuilder.build());
            logger.info("Resend Email Sent Successfully. ID: {}", response.getId());
        } catch (Exception ex) {
            logger.error("Error sending email via Resend", ex);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendInvoiceEmail(RepairOrder order, String toEmail) {
        if (toEmail == null || toEmail.isEmpty())
            return;

        // Check if Email is enabled
        String enabled = systemConfigService.getConfig("NOTIFY_EMAIL", "false");
        if (!"true".equalsIgnoreCase(enabled))
            return;

        try {
            String subject = "Hóa đơn sửa chữa - Garage AutoCare - " + order.getReception().getVehicle().getLicensePlate();
            String htmlContent = buildInvoiceContent(order);
            
            sendViaResend(toEmail, subject, htmlContent, true);
        } catch (Exception e) {
            logger.error("Error preparing invoice email for Order #{}", order.getId(), e);
        }
    }

    public String buildInvoiceContent(RepairOrder order) {
        Locale locale = Locale.of("vi", "VN");
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(locale);

        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style='font-family: sans-serif;'>");
        sb.append("<h2 style='color: #2c3e50;'>Cảm ơn quý khách đã sử dụng dịch vụ tại AutoCare</h2>");
        sb.append("<p>Xin gửi tới quý khách thông tin hóa đơn sửa chữa:</p>");

        sb.append("<h3 style='border-bottom: 1px solid #eee; padding-bottom: 5px;'>Thông tin xe</h3>");
        sb.append("<ul>");
        sb.append("<li>Biển số: <b>").append(order.getReception().getVehicle().getLicensePlate()).append("</b></li>");
        sb.append("<li>Hiệu xe: ").append(order.getReception().getVehicle().getBrand()).append("</li>");
        sb.append("</ul>");

        sb.append("<h3 style='border-bottom: 1px solid #eee; padding-bottom: 5px;'>Chi tiết dịch vụ & Phụ tùng</h3>");
        sb.append(
                "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; width: 100%; max-width: 600px; margin-bottom: 20px;'>");
        sb.append(
                "<tr style='background-color: #f8f9fa;'><th>Hạng mục</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>");

        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> {
                sb.append("<tr>");
                sb.append("<td>").append(item.getProduct().getName()).append("</td>");
                sb.append("<td style='text-align: center'>").append(item.getQuantity()).append("</td>");
                sb.append("<td style='text-align: right'>").append(currencyFormatter.format(item.getUnitPrice()))
                        .append("</td>");
                sb.append("<td style='text-align: right'>").append(currencyFormatter.format(item.getTotalAmount()))
                        .append("</td>");
                sb.append("</tr>");
            });
        }

        sb.append("</table>");

        sb.append("<h3 style='color: #e74c3c;'>Tổng cộng: ").append(currencyFormatter.format(order.getGrandTotal()))
                .append("</h3>");

        sb.append("<div style='margin-top: 30px; font-size: 0.9em; color: #7f8c8d;'>");
        sb.append("<p>Mọi thắc mắc xin vui lòng liên hệ hotline: 1900 xxxx</p>");
        sb.append("<p>Trân trọng!</p>");
        sb.append("</div>");
        sb.append("</body></html>");

        return sb.toString();
    }
}
