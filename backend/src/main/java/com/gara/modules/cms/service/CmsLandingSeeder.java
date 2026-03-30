package com.gara.modules.cms.service;

import com.gara.modules.cms.entity.CmsAnnouncement;
import com.gara.modules.cms.entity.CmsLandingSection;
import com.gara.modules.cms.repository.CmsAnnouncementRepository;
import com.gara.modules.cms.repository.CmsLandingSectionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class CmsLandingSeeder implements CommandLineRunner {

    private final CmsLandingSectionRepository repository;
    private final CmsAnnouncementRepository announcementRepository;

    public CmsLandingSeeder(CmsLandingSectionRepository repository, CmsAnnouncementRepository announcementRepository) {
        this.repository = repository;
        this.announcementRepository = announcementRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Force re-seed if any core section is missing or if count is less than 7
        long count = repository.count();
        boolean hasBlog = repository.existsBySectionId("blog");
        boolean hasSocialProof = repository.existsBySectionId("social_proof");

        if (count >= 11 && hasBlog && hasSocialProof) {
            seedAnnouncements(); // Vẫn phải kiểm tra seeding thông báo
            return; // Trả về sớm cho landing sections
        }

        repository.deleteAll(); // Reset to ensure consistent state

        List<CmsLandingSection> sections = Arrays.asList(
            createSection("hero", "hero", "Minh bạch quy trình.<br />Chi phí hợp lý.", 
                "Chẩn đoán chuyên sâu bằng thiết bị hiện đại. Báo giá chi tiết phụ tùng và nhân công. Cam kết chất lượng, tiến hành sửa chữa sau khi Khách hàng chốt phương án.",
                "https://images.unsplash.com/photo-1625047509168-a7026f36de04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80", 0),
            
            createSection("announcement", "announcement", "Thông báo từ Garage Master", 
                "Trung tâm vẫn phục vụ Quý khách xuyên suốt đợt lễ sắp tới. Hỗ trợ cứu hộ 24/7 và kiểm tra xe miễn phí bằng máy chẩn đoán chuyên dụng.",
                null, 1),

            createSection("intro", "intro", "Giải pháp toàn diện cho xế hộp của bạn", 
                "Các Hạng Mục Trọng Tâm",
                "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", 2),
            
            createSection("stats", "stats", "Niềm tin được khẳng định qua những con số", 
                "Sự hài lòng của khách hàng là thước đo chính xác nhất cho chất lượng dịch vụ tại Trung tâm.",
                null, 3),

            createSection("process", "process", "Quy trình 4 bước bảo dưỡng chuyên sâu",
                "Khách hàng chốt phương án trước khi thi công. Trung tâm cam kết chất lượng phụ tùng chính hãng và minh bạch tuyệt đối về chi phí.",
                null, 4),
            
            createSection("facilities", "facilities", "Hệ thống trang thiết bị hiện đại, toàn diện.",
                "Được đầu tư bài bản với máy móc nhập khẩu chuyên dụng, Trung tâm chúng tôi cam kết đáp ứng mọi tiêu chuẩn khắt khe nhất trong quá trình chẩn đoán và sửa chữa, đem lại sự an tâm tuyệt đối cho Quý khách.",
                "https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", 5),

            createSection("blog", "blog", "Kiến thức & Kinh nghiệm chăm sóc xe",
                "Cập nhật những thông tin bổ ích và mẹo vặt bảo dưỡng xe từ đội ngũ chuyên gia dày dạn kinh nghiệm.",
                null, 6),

            createSection("social_proof", "social_proof", "Sự tin tưởng của cộng đồng chủ xe",
                "Hàng ngàn khách hàng đã hài lòng với dịch vụ chẩn đoán minh bạch và chi phí hợp lý tại Garage Master.",
                null, 7),

            createSection("team", "team", "Đội ngũ chuyên gia dày dạn kinh nghiệm",
                "Quy tụ những Kỹ thuật viên trưởng và Cố vấn dịch vụ am hiểu sâu sắc về các dòng xe hiện đại.",
                null, 8),

            createSection("map", "map", "Vị trí của chúng tôi tại Yên Lãng",
                "Số 120 Yên Lãng, Thịnh Quang, Đống Đa, Hà Nội. Hotline: 0912 345 678. Giờ làm việc: 08:00 - 18:00 (Tất cả các ngày trong tuần).",
                null, 9),
            
            createSection("cta", "cta", "Xe cần bảo dưỡng? Đội ngũ chuyên gia luôn sẵn sàng.",
                "Quý khách vui lòng gọi Hotline để được tư vấn hoặc đặt lịch hẹn trực tiếp. Chúng tôi hỗ trợ chẩn đoán tổng quát miễn phí bằng máy chuyên dụng.",
                "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80", 10)
        );

        repository.saveAll(sections);
        System.out.println(">> CMS Landing Sections re-seeded successfully with 11 sections.");

        seedAnnouncements();
    }

    private void seedAnnouncements() {
        if (announcementRepository.count() > 0) {
            return;
        }

        CmsAnnouncement a1 = new CmsAnnouncement();
        a1.setTitle("Chương trình bảo dưỡng xe đón hè 2024");
        a1.setSlug("khuyen-mai-he-2024");
        a1.setSummary("Giảm ngay 20% các gói bảo dưỡng định kỳ và kiểm tra hệ thống điều hòa miễn phí.");
        a1.setContent("<p>Mùa hè oi bức đang đến gần, việc đảm bảo hệ thống điều hòa và động cơ hoạt động ổn định là vô cùng quan trọng. Garage Master hân hạnh mang đến chương trình ưu đãi đặc biệt:</p><ul><li>Giảm 20% phí nhân công bảo dưỡng.</li><li>Nạp gas điều hòa miễn phí cho hóa đơn trên 2 triệu.</li><li>Tặng gói vệ sinh khoang máy chuyên sâu.</li></ul><p>Liên hệ đặt lịch ngay hôm nay!</p>");
        a1.setType("PROMO");
        a1.setPinned(true);
        a1.setActive(true);
        a1.setPublishedAt(LocalDateTime.now());

        CmsAnnouncement a2 = new CmsAnnouncement();
        a2.setTitle("Thông báo lịch nghỉ lễ Giỗ Tổ Hùng Vương");
        a2.setSlug("thong-bao-nghi-le");
        a2.setSummary("Hệ thống Garage sẽ tạm nghỉ từ ngày 18/04 đến hết ngày 19/04.");
        a2.setContent("<p>Để đội ngũ nhân viên có thời gian nghỉ ngơi và sum họp gia đình, Trung tâm xin thông báo lịch nghỉ lễ như sau:</p><ul><li>Thời gian nghỉ: Từ Thứ 5 (18/04) đến hết Thứ 6 (19/04).</li><li>Thời gian hoạt động trở lại: 08:00 Thứ 7 (20/04).</li></ul><p>Trong thời gian nghỉ lễ, hotline cứu hộ 24/7 vẫn hoạt động bình thường qua số: 0912 345 678.</p>");
        a2.setType("INFO");
        a2.setActive(true);
        a2.setPublishedAt(LocalDateTime.now());

        CmsAnnouncement a3 = new CmsAnnouncement();
        a3.setTitle("Cập nhật công nghệ chẩn đoán lỗi chuyên sâu");
        a3.setSlug("cong-nghe-moi");
        a3.setSummary("Chúng tôi vừa nhập khẩu bộ thiết bị chẩn đoán từ Đức cho các dòng xe châu Âu.");
        a3.setContent("<p>Với mục tiêu nâng cao chất lượng dịch vụ, Garage Master vừa tiếp nhận bộ thiết bị chẩn đoán thế hệ mới nhất của Bosch (Đức). Thiết bị này cho phép:</p><ul><li>Đọc lỗi chính xác 100% các dòng xe BMW, Mercedes, Audi, Porsche.</li><li>Phân tích dữ liệu runtime của động cơ theo thời gian thực.</li><li>Cập nhật phần mềm hộp số và ECU theo tiêu chuẩn hãng.</li></ul><p>Đến với chúng tôi để xe của bạn được chăm sóc bởi công nghệ tiên tiến nhất.</p>");
        a3.setType("URGENT");
        a3.setActive(true);
        a3.setPublishedAt(LocalDateTime.now());

        announcementRepository.saveAll(Arrays.asList(a1, a2, a3));
        System.out.println(">> CMS Announcements seeded successfully.");
    }

    private CmsLandingSection createSection(String sectionId, String type, String title, String content, String imageUrl, int order) {
        CmsLandingSection section = new CmsLandingSection();
        section.setSectionId(sectionId);
        section.setType(type);
        section.setTitle(title);
        section.setContent(content);
        section.setImageUrl(imageUrl);
        section.setOrderIndex(order);
        section.setIsActive(true);
        return section;
    }
}
