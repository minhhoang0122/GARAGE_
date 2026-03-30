package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "role")
    private String role; // Role-based notification (e.g. THO, NHAN_VIEN_KHO)

    @org.hibernate.annotations.Nationalized
    @Column(name = "title", columnDefinition = "VARCHAR(255)")
    private String title;

    @org.hibernate.annotations.Nationalized
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "type")
    private String type; // INFO, WARNING, SUCCESS, ERROR

    @Column(name = "link")
    private String link;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "ref_id")
    private Integer refId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    public Notification() {
    }

    public Notification(Integer id, Integer userId, String role, String title, String content, String type, String link,
            Boolean isRead, LocalDateTime createdAt, User user, Integer refId) {
        this.id = id;
        this.userId = userId;
        this.role = role;
        this.title = title;
        this.content = content;
        this.type = type;
        this.link = link;
        this.isRead = isRead != null ? isRead : false;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.user = user;
        this.refId = refId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getRefId() {
        return refId;
    }

    public void setRefId(Integer refId) {
        this.refId = refId;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private Integer id;
        private Integer userId;
        private String role;
        private String title;
        private String content;
        private String type;
        private String link;
        private Boolean isRead = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private User user;
        private Integer refId;

        public NotificationBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public NotificationBuilder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public NotificationBuilder role(String role) {
            this.role = role;
            return this;
        }

        public NotificationBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationBuilder content(String content) {
            this.content = content;
            return this;
        }

        public NotificationBuilder type(String type) {
            this.type = type;
            return this;
        }

        public NotificationBuilder link(String link) {
            this.link = link;
            return this;
        }

        public NotificationBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public NotificationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public NotificationBuilder user(User user) {
            this.user = user;
            return this;
        }

        public NotificationBuilder refId(Integer refId) {
            this.refId = refId;
            return this;
        }

        public Notification build() {
            return new Notification(id, userId, role, title, content, type, link, isRead, createdAt, user, refId);
        }
    }
}
