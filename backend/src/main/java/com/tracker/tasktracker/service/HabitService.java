package com.tracker.tasktracker.service;

import com.tracker.tasktracker.dto.HabitDto;
import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.repository.HabitRepository;
import com.tracker.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class HabitService {
    
    @Autowired
    private HabitRepository habitRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Habit createHabit(HabitDto habitDto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Habit habit = new Habit();
        habit.setTitle(habitDto.getTitle());
        habit.setDescription(habitDto.getDescription());
        habit.setFrequency(Habit.Frequency.valueOf(habitDto.getFrequency().toUpperCase()));
        habit.setTargetDays(habitDto.getTargetDays());
        
        if (habitDto.getCategory() != null) {
            habit.setCategory(Habit.Category.valueOf(habitDto.getCategory().toUpperCase()));
        } else {
            habit.setCategory(Habit.Category.PERSONAL);
        }
        
        habit.setReminderTime(habitDto.getReminderTime());
        habit.setTargetCount(habitDto.getTargetCount());
        habit.setCreatedAt(LocalDateTime.now());
        habit.setActive(true);
        habit.setUser(user);
        
        return habitRepository.save(habit);
    }
    
    public List<Habit> getHabitsByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return habitRepository.findByUser(user);
    }
    
    public List<Habit> getActiveHabitsByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return habitRepository.findByUserAndIsActive(user, true);
    }
    
    public List<Habit> getHabitsByUserAndCategory(Long userId, Habit.Category category) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return habitRepository.findByUserAndCategory(user, category);
    }
    
    public Optional<Habit> getHabitById(Long habitId) {
        return habitRepository.findById(habitId);
    }
    
    public Habit updateHabit(Long habitId, HabitDto habitDto) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        if (habitDto.getTitle() != null) {
            habit.setTitle(habitDto.getTitle());
        }
        
        if (habitDto.getDescription() != null) {
            habit.setDescription(habitDto.getDescription());
        }
        
        if (habitDto.getFrequency() != null) {
            habit.setFrequency(Habit.Frequency.valueOf(habitDto.getFrequency().toUpperCase()));
        }
        
        if (habitDto.getTargetDays() != null) {
            habit.setTargetDays(habitDto.getTargetDays());
        }
        
        if (habitDto.getCategory() != null) {
            habit.setCategory(Habit.Category.valueOf(habitDto.getCategory().toUpperCase()));
        }
        
        if (habitDto.getReminderTime() != null) {
            habit.setReminderTime(habitDto.getReminderTime());
        }
        
        if (habitDto.getTargetCount() != null) {
            habit.setTargetCount(habitDto.getTargetCount());
        }
        
        return habitRepository.save(habit);
    }
    
    public void toggleHabitActive(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        
        habit.setActive(!habit.isActive());
        habitRepository.save(habit);
    }
    
    public void deleteHabit(Long habitId) {
        if (!habitRepository.existsById(habitId)) {
            throw new IllegalArgumentException("Habit not found");
        }
        
        habitRepository.deleteById(habitId);
    }
    
    public List<Habit> getHabitsForUserByDate(Long userId, LocalDate date) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Get all active habits for the user
        List<Habit> activeHabits = habitRepository.findByUserAndIsActive(user, true);
        
        // Filter habits based on the target days (e.g., if the habit is set for Mondays and today is Monday)
        return activeHabits.stream()
            .filter(habit -> isHabitScheduledForDate(habit, date))
            .toList();
    }
    
    private boolean isHabitScheduledForDate(Habit habit, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue() % 7; // 0 for Sunday, 1 for Monday, etc.
        
        // Check if the habit is scheduled for this day of the week
        if (habit.getFrequency() == Habit.Frequency.DAILY) {
            return true;
        } else if (habit.getFrequency() == Habit.Frequency.WEEKLY || 
                  habit.getFrequency() == Habit.Frequency.CUSTOM) {
            Set<Integer> targetDays = habit.getTargetDays();
            return targetDays != null && targetDays.contains(dayOfWeek);
        }
        
        return false;
    }
}