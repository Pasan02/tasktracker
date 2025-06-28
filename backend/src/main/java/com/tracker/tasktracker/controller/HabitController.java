package com.tracker.tasktracker.controller;

import com.tracker.tasktracker.dto.HabitDto;
import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.HabitCompletion;
import com.tracker.tasktracker.service.HabitCompletionService;
import com.tracker.tasktracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173") // React dev server port
public class HabitController {

    @Autowired
    private HabitService habitService;
    
    @Autowired
    private HabitCompletionService habitCompletionService;

    @PostMapping
    public ResponseEntity<Habit> createHabit(@Valid @RequestBody HabitDto habitDto, @RequestParam Long userId) {
        Habit habit = habitService.createHabit(habitDto, userId);
        return new ResponseEntity<>(habit, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable Long id) {
        Optional<Habit> habit = habitService.getHabitById(id);
        return habit.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Habit>> getHabitsByUser(@PathVariable Long userId) {
        List<Habit> habits = habitService.getHabitsByUser(userId);
        return ResponseEntity.ok(habits);
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<Habit>> getActiveHabitsByUser(@PathVariable Long userId) {
        List<Habit> habits = habitService.getActiveHabitsByUser(userId);
        return ResponseEntity.ok(habits);
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<List<Habit>> getHabitsByUserAndCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        Habit.Category habitCategory = Habit.Category.valueOf(category.toUpperCase());
        List<Habit> habits = habitService.getHabitsByUserAndCategory(userId, habitCategory);
        return ResponseEntity.ok(habits);
    }

    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<Habit>> getHabitsForUserByDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Habit> habits = habitService.getHabitsForUserByDate(userId, date);
        return ResponseEntity.ok(habits);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(
            @PathVariable Long id,
            @Valid @RequestBody HabitDto habitDto) {
        Habit updatedHabit = habitService.updateHabit(id, habitDto);
        return ResponseEntity.ok(updatedHabit);
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Void> toggleHabitActive(@PathVariable Long id) {
        habitService.toggleHabitActive(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return ResponseEntity.noContent().build();
    }

    // Habit Completion Endpoints
    @PostMapping("/{habitId}/complete")
    public ResponseEntity<HabitCompletion> markHabitAsCompleted(
            @PathVariable Long habitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            HabitCompletion completion = habitCompletionService.markHabitAsCompleted(habitId, date);
            return ResponseEntity.ok(completion);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @DeleteMapping("/{habitId}/complete")
    public ResponseEntity<Void> unmarkHabitCompletion(
            @PathVariable Long habitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            habitCompletionService.unmarkHabitCompletion(habitId, date);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{habitId}/completions")
    public ResponseEntity<List<HabitCompletion>> getHabitCompletions(@PathVariable Long habitId) {
        List<HabitCompletion> completions = habitCompletionService.getHabitCompletions(habitId);
        return ResponseEntity.ok(completions);
    }

    @GetMapping("/{habitId}/completions/between")
    public ResponseEntity<List<HabitCompletion>> getHabitCompletionsBetweenDates(
            @PathVariable Long habitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<HabitCompletion> completions = habitCompletionService.getHabitCompletionsBetweenDates(
                habitId, startDate, endDate);
        return ResponseEntity.ok(completions);
    }

    @GetMapping("/{habitId}/stats")
    public ResponseEntity<Map<String, Integer>> getHabitStats(@PathVariable Long habitId) {
        int currentStreak = habitCompletionService.getCurrentStreak(habitId);
        int longestStreak = habitCompletionService.getLongestStreak(habitId);
        
        Map<String, Integer> stats = new HashMap<>();
        stats.put("currentStreak", currentStreak);
        stats.put("longestStreak", longestStreak);
        
        return ResponseEntity.ok(stats);
    }
}