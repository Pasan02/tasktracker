package com.tracker.tasktracker.service;

import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.HabitCompletion;
import com.tracker.tasktracker.repository.HabitCompletionRepository;
import com.tracker.tasktracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HabitCompletionService {
    
    @Autowired
    private HabitCompletionRepository habitCompletionRepository;
    
    @Autowired
    private HabitRepository habitRepository;
    
    public HabitCompletion markHabitAsCompleted(Long habitId, LocalDate completionDate) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        // Check if already marked as completed for this date
        if (habitCompletionRepository.existsByHabitAndCompletionDate(habit, completionDate)) {
            throw new IllegalStateException("Habit already marked as completed for this date");
        }
        
        HabitCompletion completion = new HabitCompletion();
        completion.setHabit(habit);
        completion.setCompletionDate(completionDate);
        
        return habitCompletionRepository.save(completion);
    }
    
    public void unmarkHabitCompletion(Long habitId, LocalDate completionDate) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        Optional<HabitCompletion> completion = habitCompletionRepository.findByHabitAndCompletionDate(habit, completionDate);
        
        if (completion.isPresent()) {
            habitCompletionRepository.delete(completion.get());
        } else {
            throw new IllegalArgumentException("No completion record found for this date");
        }
    }
    
    public boolean isHabitCompletedOnDate(Long habitId, LocalDate date) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        return habitCompletionRepository.existsByHabitAndCompletionDate(habit, date);
    }
    
    public List<HabitCompletion> getHabitCompletions(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        return habitCompletionRepository.findByHabit(habit);
    }
    
    public List<HabitCompletion> getHabitCompletionsBetweenDates(Long habitId, LocalDate startDate, LocalDate endDate) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        return habitCompletionRepository.findByHabitAndCompletionDateBetween(habit, startDate, endDate);
    }
    
    public List<LocalDate> getCompletionDates(Long habitId) {
        List<HabitCompletion> completions = getHabitCompletions(habitId);
        
        return completions.stream()
            .map(HabitCompletion::getCompletionDate)
            .collect(Collectors.toList());
    }
    
    public int getCurrentStreak(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate checkDate = today;
        
        // Check for consecutive completed days
        while (true) {
            if (habitCompletionRepository.existsByHabitAndCompletionDate(habit, checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    public int getLongestStreak(Long habitId) {
        List<LocalDate> completionDates = getCompletionDates(habitId);
        
        if (completionDates.isEmpty()) {
            return 0;
        }
        
        // Sort dates in ascending order
        completionDates.sort(LocalDate::compareTo);
        
        int currentStreak = 1;
        int maxStreak = 1;
        
        for (int i = 1; i < completionDates.size(); i++) {
            LocalDate previousDate = completionDates.get(i - 1);
            LocalDate currentDate = completionDates.get(i);
            
            // Check if dates are consecutive
            if (ChronoUnit.DAYS.between(previousDate, currentDate) == 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return maxStreak;
    }
    
    public List<HabitCompletion> getCompletionsForUserHabits(List<Habit> habits, LocalDate startDate, LocalDate endDate) {
        return habitCompletionRepository.findByHabitInAndCompletionDateBetween(habits, startDate, endDate);
    }
}