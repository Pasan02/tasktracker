package com.tracker.tasktracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "habits")
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String title;
    
    @Size(max = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Frequency frequency;
    
    @ElementCollection
    @CollectionTable(name = "habit_target_days", joinColumns = @JoinColumn(name = "habit_id"))
    @Column(name = "day_of_week")
    private Set<Integer> targetDays;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    private LocalTime reminderTime;
    
    private Integer targetCount;
    
    private LocalDateTime createdAt;
    
    private boolean isActive;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Enum definitions
    public enum Frequency {
        DAILY, WEEKLY, CUSTOM
    }
    
    public enum Category {
        PERSONAL, HEALTH, LEARNING, WORK, SOCIAL, OTHER
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public Set<Integer> getTargetDays() {
        return targetDays;
    }

    public void setTargetDays(Set<Integer> targetDays) {
        this.targetDays = targetDays;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public LocalTime getReminderTime() {
        return reminderTime;
    }
    
    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }
    
    public Integer getTargetCount() {
        return targetCount;
    }
    
    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}