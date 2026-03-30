package com.gara.modules.cms.controller;

import com.gara.modules.cms.entity.CmsAnnouncement;
import com.gara.modules.cms.entity.CmsBlogPost;
import com.gara.modules.cms.entity.CmsLandingSection;
import com.gara.modules.cms.repository.CmsAnnouncementRepository;
import com.gara.modules.cms.repository.CmsBlogPostRepository;
import com.gara.modules.cms.repository.CmsLandingSectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/cms")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCmsController {

    private final CmsLandingSectionRepository landingRepository;
    private final CmsBlogPostRepository blogRepository;
    private final CmsAnnouncementRepository announcementRepository;

    public AdminCmsController(
            CmsLandingSectionRepository landingRepository, 
            CmsBlogPostRepository blogRepository,
            CmsAnnouncementRepository announcementRepository) {
        this.landingRepository = landingRepository;
        this.blogRepository = blogRepository;
        this.announcementRepository = announcementRepository;
    }

    // --- Landing Page Management ---

    @GetMapping("/landing")
    public ResponseEntity<List<CmsLandingSection>> getAllLandingSections() {
        return ResponseEntity.ok(landingRepository.findAll());
    }

    @PostMapping("/landing")
    public ResponseEntity<CmsLandingSection> createLandingSection(@RequestBody CmsLandingSection section) {
        return ResponseEntity.ok(landingRepository.save(section));
    }

    @PutMapping("/landing/{id}")
    public ResponseEntity<CmsLandingSection> updateLandingSection(@PathVariable Integer id, @RequestBody CmsLandingSection details) {
        return landingRepository.findById(id).map(section -> {
            section.setTitle(details.getTitle());
            section.setContent(details.getContent());
            section.setSectionId(details.getSectionId());
            section.setImageUrl(details.getImageUrl());
            section.setOrderIndex(details.getOrderIndex());
            section.setIsActive(details.getIsActive());
            return ResponseEntity.ok(landingRepository.save(section));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/landing/{id}")
    public ResponseEntity<Void> deleteLandingSection(@PathVariable Integer id) {
        landingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Blog Management ---

    @GetMapping("/blog")
    public ResponseEntity<List<CmsBlogPost>> getAllBlogPosts() {
        return ResponseEntity.ok(blogRepository.findAll());
    }

    @GetMapping("/blog/{id}")
    public ResponseEntity<CmsBlogPost> getBlogPost(@PathVariable Integer id) {
        return blogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/blog")
    public ResponseEntity<CmsBlogPost> createBlogPost(@RequestBody CmsBlogPost post) {
        return ResponseEntity.ok(blogRepository.save(post));
    }

    @PutMapping("/blog/{id}")
    public ResponseEntity<CmsBlogPost> updateBlogPost(@PathVariable Integer id, @RequestBody CmsBlogPost postDetails) {
        return blogRepository.findById(id).map(post -> {
            post.setTitle(postDetails.getTitle());
            post.setSlug(postDetails.getSlug());
            post.setExcerpt(postDetails.getExcerpt());
            post.setContent(postDetails.getContent());
            post.setThumbnailUrl(postDetails.getThumbnailUrl());
            post.setStatus(postDetails.getStatus());
            post.setPublishedAt(postDetails.getPublishedAt());
            return ResponseEntity.ok(blogRepository.save(post));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/blog/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Integer id) {
        blogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Announcement Management ---

    @GetMapping("/announcements")
    public ResponseEntity<List<CmsAnnouncement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAll());
    }

    @GetMapping("/announcements/{id}")
    public ResponseEntity<CmsAnnouncement> getAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/announcements")
    public ResponseEntity<CmsAnnouncement> createAnnouncement(@RequestBody CmsAnnouncement announcement) {
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<CmsAnnouncement> updateAnnouncement(@PathVariable Long id, @RequestBody CmsAnnouncement details) {
        return announcementRepository.findById(id).map(ann -> {
            ann.setTitle(details.getTitle());
            ann.setSlug(details.getSlug());
            ann.setSummary(details.getSummary());
            ann.setContent(details.getContent());
            ann.setThumbnailUrl(details.getThumbnailUrl());
            ann.setType(details.getType());
            ann.setPublishedAt(details.getPublishedAt());
            ann.setExpiredAt(details.getExpiredAt());
            ann.setActive(details.isActive());
            ann.setPinned(details.isPinned());
            return ResponseEntity.ok(announcementRepository.save(ann));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
