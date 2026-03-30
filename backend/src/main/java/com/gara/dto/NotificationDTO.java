package com.gara.dto;

import java.time.LocalDateTime;

public record NotificationDTO(
    Integer id,
    Integer userId,
    String role,
    String title,
    String content,
    String type,
    String link,
    Boolean isRead,
    LocalDateTime createdAt
) {
    public static NotificationDTOBuilder builder() {
        return new NotificationDTOBuilder();
    }

    public static class NotificationDTOBuilder {
        private Integer id;
        private Integer userId;
        private String role;
        private String title;
        private String content;
        private String type;
        private String link;
        private Boolean isRead;
        private LocalDateTime createdAt;

        public NotificationDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public NotificationDTOBuilder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public NotificationDTOBuilder role(String role) {
            this.role = role;
            return this;
        }

        public NotificationDTOBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationDTOBuilder content(String content) {
            this.content = content;
            return this;
        }

        public NotificationDTOBuilder type(String type) {
            this.type = type;
            return this;
        }

        public NotificationDTOBuilder link(String link) {
            this.link = link;
            return this;
        }

        public NotificationDTOBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public NotificationDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public NotificationDTO build() {
            return new NotificationDTO(id, userId, role, title, content, type, link, isRead, createdAt);
        }
    }
}
