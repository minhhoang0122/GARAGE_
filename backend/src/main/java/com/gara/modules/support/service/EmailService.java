package com.gara.modules.support.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.util.Properties;
import com.gara.entity.RepairOrder;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${SENDGRID_API_KEY:}")
    private String sendGridApiKey;

    private String fromEmail = "letann2303@gmail.com";

    private final SystemConfigService systemConfigService;

    public EmailService(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @org.springframework.scheduling.annotation.Async
    public void sendText(String to, String subject, String body) {
        sendViaSendGrid(to, subject, new Content("text/plain", body));
    }

    @org.springframework.scheduling.annotation.Async
    public void sendHtml(String to, String subject, String htmlContent) {
        sendViaSendGrid(to, subject, new Content("text/html", htmlContent));
    }

    private void sendViaSendGrid(String to, String subject, Content content) {
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            logger.warn("SendGrid API Key is not configured. Email not sent to {}", to);
            return;
        }

        Email from = new Email(fromEmail);
        Email recipient = new Email(to);
        logger.info("Email Details - From: {}, To: {}, Using Key: {}", fromEmail, to, (sendGridApiKey != null && !sendGridApiKey.isEmpty() ? "YES" : "NO"));
        com.sendgrid.helpers.mail.Mail mail = new com.sendgrid.helpers.mail.Mail(from, subject, recipient, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            logger.info("SendGrid Status: {}, Sent to: {}", response.getStatusCode(), to);
        } catch (IOException ex) {
            logger.error("Error sending email via SendGrid", ex);
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
            JavaMailSender sender = createSender();
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Hóa đơn sửa chữa - Garage AutoCare - " + order.getReception().getVehicle().getLicensePlate());

            String content = buildInvoiceContent(order);
            helper.setText(content, true); // HTML = true

            sender.send(message);
        } catch (Exception e) {
            // Don't throw, just log. Email failure shouldn't rollback transaction.
        }
    }

    private JavaMailSender createSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);

        mailSender.setUsername(systemConfigService.getConfig("MAIL_USERNAME", ""));
        mailSender.setPassword(systemConfigService.getConfig("MAIL_PASSWORD", ""));

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        // props.put("mail.debug", "true");

        return mailSender;
    }

    public String buildInvoiceContent(RepairOrder order) {
        Locale locale = Locale.of("vi", "VN");
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(locale);

        StringBuilder sb = new StringBuilder();
        sb.append("<html><body>");
        sb.append("<h2>Cảm ơn quý khách đã sử dụng dịch vụ tại AutoCare</h2>");
        sb.append("<p>Xin gửi tới quý khách thông tin hóa đơn sửa chữa:</p>");

        sb.append("<h3>Thông tin xe</h3>");
        sb.append("<ul>");
        sb.append("<li>Biển số: <b>").append(order.getReception().getVehicle().getLicensePlate()).append("</b></li>");
        sb.append("<li>Hiệu xe: ").append(order.getReception().getVehicle().getBrand()).append("</li>");
        sb.append("</ul>");

        sb.append("<h3>Chi tiết dịch vụ & Phụ tùng</h3>");
        sb.append(
                "<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse; width: 100%; max-width: 600px;'>");
        sb.append(
                "<tr style='background-color: #f2f2f2;'><th>Hạng mục</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>");

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

        sb.append("</table>");

        sb.append("<h3>Tổng cộng: <span style='color: red'>").append(currencyFormatter.format(order.getGrandTotal()))
                .append("</span></h3>");

        sb.append("<p>Mọi thắc mắc xin vui lòng liên hệ hotline: 1900 xxxx</p>");
        sb.append("<p>Trân trọng!</p>");
        sb.append("</body></html>");

        return sb.toString();
    }
}
