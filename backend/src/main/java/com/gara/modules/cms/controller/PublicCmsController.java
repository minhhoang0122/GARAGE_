package com.gara.modules.cms.controller;

import com.gara.modules.cms.entity.CmsAnnouncement;
import com.gara.modules.cms.entity.CmsBlogPost;
import com.gara.modules.cms.entity.CmsLandingSection;
import com.gara.modules.cms.repository.CmsAnnouncementRepository;
import com.gara.modules.cms.repository.CmsBlogPostRepository;
import com.gara.modules.cms.repository.CmsLandingSectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/public/cms")
public class PublicCmsController {

    private final CmsLandingSectionRepository landingRepository;
    private final CmsBlogPostRepository blogRepository;
    private final CmsAnnouncementRepository announcementRepository;

    public PublicCmsController(
            CmsLandingSectionRepository landingRepository, 
            CmsBlogPostRepository blogRepository,
            CmsAnnouncementRepository announcementRepository) {
        this.landingRepository = landingRepository;
        this.blogRepository = blogRepository;
        this.announcementRepository = announcementRepository;
    }

    @GetMapping("/landing")
    public ResponseEntity<List<CmsLandingSection>> getLandingSections() {
        return ResponseEntity.ok(landingRepository.findByIsActiveOrderByOrderIndexAsc(true));
    }

    @GetMapping("/blog")
    public ResponseEntity<List<CmsBlogPost>> getBlogPosts() {
        return ResponseEntity.ok(blogRepository.findPublished("PUBLISHED", LocalDateTime.now()));
    }

    @GetMapping("/blog/{slug}")
    public ResponseEntity<CmsBlogPost> getBlogPost(@PathVariable String slug) {
        return blogRepository.findBySlugAndStatus(slug, "PUBLISHED")
                .filter(b -> b.getPublishedAt() == null || b.getPublishedAt().isBefore(LocalDateTime.now()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<CmsAnnouncement>> getAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllActive(LocalDateTime.now()));
    }


    @GetMapping("/announcements/{slug}")
    public ResponseEntity<CmsAnnouncement> getAnnouncement(@PathVariable String slug) {
        return announcementRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

