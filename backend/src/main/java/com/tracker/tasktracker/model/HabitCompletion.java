package com.tracker.tasktracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "habit_completions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"habit_id", "completion_date"})
})
public class HabitCompletion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;
    
    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;
    
    public HabitCompletion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Habit getHabit() {
        return habit;
    }

    public void setHabit(Habit habit) {
        this.habit = habit;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }
}