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
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HabitCompletionService {
    
    @Autowired
    private HabitCompletionRepository habitCompletionRepository;
    
    @Autowired
    private HabitRepository habitRepository;
    
    public HabitCompletion markHabitAsCompleted(Long habitId, LocalDate completionDate) {
        System.out.println("=== MARKING HABIT AS COMPLETED ===");
        System.out.println("Habit ID: " + habitId + ", Date: " + completionDate);
        
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found with ID: " + habitId));
        
        System.out.println("Found habit: " + habit.getTitle());
        
        // Check if already marked as completed for this date
        boolean alreadyCompleted = habitCompletionRepository.existsByHabitAndCompletionDate(habit, completionDate);
        if (alreadyCompleted) {
            System.err.println("Habit already marked as completed for this date");
            throw new IllegalStateException("Habit already marked as completed for this date");
        }
        
        HabitCompletion completion = new HabitCompletion();
        completion.setHabit(habit);
        completion.setCompletionDate(completionDate);
        
        HabitCompletion savedCompletion = habitCompletionRepository.save(completion);
        System.out.println("Habit completion saved with ID: " + savedCompletion.getId());
        
        return savedCompletion;
    }
    
    public void unmarkHabitCompletion(Long habitId, LocalDate completionDate) {
        System.out.println("=== UNMARKING HABIT COMPLETION ===");
        System.out.println("Habit ID: " + habitId + ", Date: " + completionDate);
        
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found with ID: " + habitId));
        
        Optional<HabitCompletion> completion = habitCompletionRepository.findByHabitAndCompletionDate(habit, completionDate);
        
        if (completion.isPresent()) {
            System.out.println("Found completion to delete: " + completion.get().getId());
            habitCompletionRepository.delete(completion.get());
            System.out.println("Habit completion deleted successfully");
        } else {
            System.err.println("No completion record found for this date");
            throw new IllegalArgumentException("No completion record found for this date");
        }
    }
    
    public boolean isHabitCompletedOnDate(Long habitId, LocalDate date) {
        System.out.println("=== CHECKING HABIT COMPLETION ===");
        System.out.println("Habit ID: " + habitId + ", Date: " + date);
        
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found with ID: " + habitId));
        
        boolean isCompleted = habitCompletionRepository.existsByHabitAndCompletionDate(habit, date);
        System.out.println("Is completed: " + isCompleted);
        
        return isCompleted;
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
        
        // Check for consecutive completed days, considering habit frequency
        while (true) {
            // Check if this habit should be done on this day
            if (isHabitScheduledForDate(habit, checkDate)) {
                if (habitCompletionRepository.existsByHabitAndCompletionDate(habit, checkDate)) {
                    streak++;
                } else {
                    // If the habit was supposed to be done but wasn't, break the streak
                    break;
                }
            }
            // Move to previous day
            checkDate = checkDate.minusDays(1);
            
            // Don't go back more than 365 days
            if (ChronoUnit.DAYS.between(checkDate, today) > 365) {
                break;
            }
        }
        
        return streak;
    }
    
    private boolean isHabitScheduledForDate(Habit habit, LocalDate date) {
        if (habit.getFrequency() == Habit.Frequency.DAILY) {
            return true;
        } else if (habit.getFrequency() == Habit.Frequency.WEEKLY || 
                  habit.getFrequency() == Habit.Frequency.CUSTOM) {
            Set<Integer> targetDays = habit.getTargetDays();
            int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday=0)
            return targetDays != null && targetDays.contains(dayOfWeek);
        }
        return false;
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