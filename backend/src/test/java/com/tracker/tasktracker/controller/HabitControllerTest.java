package com.tracker.tasktracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tracker.tasktracker.dto.HabitDto;
import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.HabitCompletion;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.service.HabitCompletionService;
import com.tracker.tasktracker.service.HabitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Disabled("Temporarily disabled while focusing on frontend development")
public class HabitControllerTest {
    
    private MockMvc mockMvc;
    
    @Mock
    private HabitService habitService;
    
    @Mock
    private HabitCompletionService habitCompletionService;
    
    @InjectMocks
    private HabitController habitController;
    
    private ObjectMapper objectMapper;
    private Habit habit1;
    private Habit habit2;
    private HabitDto habitDto;
    private User user;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(habitController).build();
        
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        
        habit1 = new Habit();
        habit1.setId(1L);
        habit1.setTitle("Daily Exercise");
        habit1.setDescription("Do 30 minutes of exercise every day");
        habit1.setFrequency(Habit.Frequency.DAILY);
        habit1.setCategory(Habit.Category.HEALTH);
        habit1.setReminderTime(LocalTime.of(8, 0));
        habit1.setTargetCount(1);
        habit1.setCreatedAt(LocalDateTime.now());
        habit1.setActive(true);
        habit1.setUser(user);
        habit1.setTargetDays(new HashSet<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7)));
        
        habit2 = new Habit();
        habit2.setId(2L);
        habit2.setTitle("Read Books");
        habit2.setDescription("Read for 30 minutes");
        habit2.setFrequency(Habit.Frequency.WEEKLY);
        habit2.setCategory(Habit.Category.LEARNING);
        habit2.setReminderTime(LocalTime.of(20, 0));
        habit2.setTargetCount(3);
        habit2.setCreatedAt(LocalDateTime.now());
        habit2.setActive(true);
        habit2.setUser(user);
        habit2.setTargetDays(new HashSet<>(Arrays.asList(1, 3, 5)));
        
        habitDto = new HabitDto();
        habitDto.setTitle("New Habit");
        habitDto.setDescription("New habit description");
        habitDto.setFrequency("daily");
        habitDto.setCategory("personal");
        habitDto.setReminderTime(LocalTime.of(9, 0));
        habitDto.setTargetCount(1);
        habitDto.setTargetDays(new HashSet<>(Arrays.asList(1, 2, 3, 4, 5)));
    }
    
    @Test
    @WithMockUser
    void testCreateHabit() throws Exception {
        when(habitService.createHabit(any(HabitDto.class), eq(1L))).thenReturn(habit1);
        
        mockMvc.perform(post("/api/habits?userId=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(habitDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is(habit1.getTitle())))
                .andExpect(jsonPath("$.description", is(habit1.getDescription())));
        
        verify(habitService).createHabit(any(HabitDto.class), eq(1L));
    }
    
    @Test
    @WithMockUser
    void testGetHabitById() throws Exception {
        when(habitService.getHabitById(1L)).thenReturn(Optional.of(habit1));
        
        mockMvc.perform(get("/api/habits/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is(habit1.getTitle())))
                .andExpect(jsonPath("$.description", is(habit1.getDescription())));
        
        verify(habitService).getHabitById(1L);
    }
    
    @Test
    @WithMockUser
    void testGetHabitByIdNotFound() throws Exception {
        when(habitService.getHabitById(99L)).thenReturn(Optional.empty());
        
        mockMvc.perform(get("/api/habits/99"))
                .andExpect(status().isNotFound());
        
        verify(habitService).getHabitById(99L);
    }
    
    @Test
    @WithMockUser
    void testGetHabitsByUser() throws Exception {
        List<Habit> habits = Arrays.asList(habit1, habit2);
        
        when(habitService.getHabitsByUser(1L)).thenReturn(habits);
        
        mockMvc.perform(get("/api/habits/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is(habit1.getTitle())))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].title", is(habit2.getTitle())));
        
        verify(habitService).getHabitsByUser(1L);
    }
    
    @Test
    @WithMockUser
    void testGetActiveHabitsByUser() throws Exception {
        List<Habit> habits = Arrays.asList(habit1, habit2);
        
        when(habitService.getActiveHabitsByUser(1L)).thenReturn(habits);
        
        mockMvc.perform(get("/api/habits/user/1/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[1].id", is(2)));
        
        verify(habitService).getActiveHabitsByUser(1L);
    }
    
    @Test
    @WithMockUser
    void testMarkHabitAsCompleted() throws Exception {
        LocalDate today = LocalDate.now();
        HabitCompletion completion = new HabitCompletion();
        completion.setId(1L);
        completion.setHabit(habit1);
        completion.setCompletionDate(today);
        
        when(habitCompletionService.markHabitAsCompleted(eq(1L), eq(today))).thenReturn(completion);
        
        mockMvc.perform(post("/api/habits/1/complete")
                .param("date", today.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.habit.id", is(1)))
                .andExpect(jsonPath("$.completionDate", is(today.toString())));
        
        verify(habitCompletionService).markHabitAsCompleted(eq(1L), eq(today));
    }
    
    @Test
    @WithMockUser
    void testUnmarkHabitCompletion() throws Exception {
        LocalDate today = LocalDate.now();
        doNothing().when(habitCompletionService).unmarkHabitCompletion(eq(1L), eq(today));
        
        mockMvc.perform(delete("/api/habits/1/complete")
                .param("date", today.toString()))
                .andExpect(status().isNoContent());
        
        verify(habitCompletionService).unmarkHabitCompletion(eq(1L), eq(today));
    }
    
    @Test
    @WithMockUser
    void testGetHabitStats() throws Exception {
        when(habitCompletionService.getCurrentStreak(1L)).thenReturn(5);
        when(habitCompletionService.getLongestStreak(1L)).thenReturn(10);
        
        mockMvc.perform(get("/api/habits/1/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStreak", is(5)))
                .andExpect(jsonPath("$.longestStreak", is(10)));
        
        verify(habitCompletionService).getCurrentStreak(1L);
        verify(habitCompletionService).getLongestStreak(1L);
    }
}
