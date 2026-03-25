package com.gara.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer id;
    private Integer userId;
    private String role;
    private String title;
    private String content;
    private String type;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
