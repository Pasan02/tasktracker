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
    List<HabitCompletion> findByHabit(Habit habit);
    
    List<HabitCompletion> findByHabitAndCompletionDateBetween(Habit habit, LocalDate start, LocalDate end);
    
    Optional<HabitCompletion> findByHabitAndCompletionDate(Habit habit, LocalDate completionDate);
    
    boolean existsByHabitAndCompletionDate(Habit habit, LocalDate completionDate);
    
    List<HabitCompletion> findByHabitInAndCompletionDateBetween(List<Habit> habits, LocalDate start, LocalDate end);
}