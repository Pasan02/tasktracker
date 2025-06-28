package com.tracker.tasktracker.repository;

import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser(User user);
    
    List<Habit> findByUserAndIsActive(User user, boolean isActive);
    
    List<Habit> findByUserAndCategory(User user, Habit.Category category);
}