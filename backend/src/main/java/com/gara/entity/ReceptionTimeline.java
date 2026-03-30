package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reception_timeline")
public class ReceptionTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reception_id", nullable = false)
    private Integer receptionId;

    @Column(name = "actor_id")
    private Integer actorId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Column(name = "action_type", length = 50, nullable = false)
    private String actionType; // ADD_ITEM, DELETE_ITEM, UPDATE_ITEM, STATUS_CHANGE, NOTE, MAN_WORK

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "is_internal")
    private Boolean isInternal = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_id", insertable = false, updatable = false)
    private Reception reception;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ReceptionTimeline() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getReceptionId() { return receptionId; }
    public void setReceptionId(Integer receptionId) { this.receptionId = receptionId; }

    public Integer getActorId() { return actorId; }
    public void setActorId(Integer actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ReceptionTimelineBuilder builder() {
        return new ReceptionTimelineBuilder();
    }

    public static class ReceptionTimelineBuilder {
        private Integer receptionId;
        private Integer actorId;
        private String actorName;
        private String actorRole;
        private String actionType;
        private String content;
        private String oldValue;
        private String newValue;
        private Boolean isInternal = false;

        public ReceptionTimelineBuilder receptionId(Integer receptionId) { this.receptionId = receptionId; return this; }
        public ReceptionTimelineBuilder actorId(Integer actorId) { this.actorId = actorId; return this; }
        public ReceptionTimelineBuilder actorName(String actorName) { this.actorName = actorName; return this; }
        public ReceptionTimelineBuilder actorRole(String actorRole) { this.actorRole = actorRole; return this; }
        public ReceptionTimelineBuilder actionType(String actionType) { this.actionType = actionType; return this; }
        public ReceptionTimelineBuilder content(String content) { this.content = content; return this; }
        public ReceptionTimelineBuilder oldValue(String oldValue) { this.oldValue = oldValue; return this; }
        public ReceptionTimelineBuilder newValue(String newValue) { this.newValue = newValue; return this; }
        public ReceptionTimelineBuilder isInternal(Boolean isInternal) { this.isInternal = isInternal; return this; }

        public ReceptionTimeline build() {
            ReceptionTimeline timeline = new ReceptionTimeline();
            timeline.setReceptionId(receptionId);
            timeline.setActorId(actorId);
            timeline.setActorName(actorName);
            timeline.setActorRole(actorRole);
            timeline.setActionType(actionType);
            timeline.setContent(content);
            timeline.setOldValue(oldValue);
            timeline.setNewValue(newValue);
            timeline.setIsInternal(isInternal);
            return timeline;
        }
    }
}
