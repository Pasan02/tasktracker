package com.tracker.tasktracker.repository;

import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    
    // Check if habit is completed on a specific date
    boolean existsByHabitAndCompletionDate(Habit habit, LocalDate completionDate);
    
    // Find completion by habit and date
    Optional<HabitCompletion> findByHabitAndCompletionDate(Habit habit, LocalDate completionDate);
    
    // Find all completions for a habit
    List<HabitCompletion> findByHabit(Habit habit);
    
    // Find completions between dates
    List<HabitCompletion> findByHabitAndCompletionDateBetween(Habit habit, LocalDate startDate, LocalDate endDate);
    
    // Find completions for multiple habits between dates
    List<HabitCompletion> findByHabitInAndCompletionDateBetween(List<Habit> habits, LocalDate startDate, LocalDate endDate);
}