package com.tracker.tasktracker.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tracker.tasktracker.dto.TaskDto;
import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.service.TaskService;

@SpringBootTest
@Disabled("Temporarily disabled while focusing on frontend development")
class TaskControllerTest {
    
    private MockMvc mockMvc;
    
    @Mock
    private TaskService taskService;
    
    @InjectMocks
    private TaskController taskController;
    
    private ObjectMapper objectMapper;
    private Task task1;
    private Task task2;
    private TaskDto taskDto;
    private User user;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
        
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        
        task1 = new Task();
        task1.setId(1L);
        task1.setTitle("Test Task 1");
        task1.setDescription("Description for test task 1");
        task1.setStatus(Task.Status.TODO);
        task1.setPriority(Task.Priority.MEDIUM);
        task1.setCategory(Task.Category.WORK);
        task1.setDueDate(LocalDate.now().plusDays(1));
        task1.setDueTime(LocalTime.of(12, 0));
        task1.setCreatedAt(LocalDateTime.now());
        task1.setUser(user);
        
        task2 = new Task();
        task2.setId(2L);
        task2.setTitle("Test Task 2");
        task2.setDescription("Description for test task 2");
        task2.setStatus(Task.Status.IN_PROGRESS);
        task2.setPriority(Task.Priority.HIGH);
        task2.setCategory(Task.Category.PERSONAL);
        task2.setDueDate(LocalDate.now().plusDays(2));
        task2.setDueTime(LocalTime.of(15, 0));
        task2.setCreatedAt(LocalDateTime.now());
        task2.setUser(user);
        
        taskDto = new TaskDto();
        taskDto.setTitle("New Task");
        taskDto.setDescription("New task description");
        taskDto.setPriority("high");
        taskDto.setCategory("work");
        taskDto.setStatus("todo");
        taskDto.setDueDate(LocalDate.now().plusDays(3));
        taskDto.setDueTime(LocalTime.of(10, 0));
    }
    
    @Test
    @WithMockUser
    void testCreateTask() throws Exception {
        Task createdTask = new Task();
        createdTask.setId(3L);
        createdTask.setTitle(taskDto.getTitle());
        createdTask.setDescription(taskDto.getDescription());
        createdTask.setStatus(Task.Status.TODO);
        createdTask.setPriority(Task.Priority.HIGH);
        createdTask.setCategory(Task.Category.WORK);
        createdTask.setDueDate(taskDto.getDueDate());
        createdTask.setDueTime(taskDto.getDueTime());
        createdTask.setCreatedAt(LocalDateTime.now());
        createdTask.setUser(user);
        
        when(taskService.createTask(any(TaskDto.class), eq(1L))).thenReturn(createdTask);
        when(taskService.convertToDto(any(Task.class))).thenCallRealMethod();
        
        mockMvc.perform(post("/api/tasks?userId=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is(taskDto.getTitle())))
                .andExpect(jsonPath("$.description", is(taskDto.getDescription())))
                .andExpect(jsonPath("$.status", is(createdTask.getStatus().name().toLowerCase())))
                .andExpect(jsonPath("$.priority", is(createdTask.getPriority().name().toLowerCase())))
                .andExpect(jsonPath("$.category", is(createdTask.getCategory().name().toLowerCase())));
        
        verify(taskService).createTask(any(TaskDto.class), eq(1L));
    }
    
    @Test
    @WithMockUser
    void testGetTaskById() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(Optional.of(task1));
        when(taskService.convertToDto(task1)).thenCallRealMethod();
        
        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is(task1.getTitle())))
                .andExpect(jsonPath("$.description", is(task1.getDescription())))
                .andExpect(jsonPath("$.status", is(task1.getStatus().name().toLowerCase())))
                .andExpect(jsonPath("$.priority", is(task1.getPriority().name().toLowerCase())))
                .andExpect(jsonPath("$.category", is(task1.getCategory().name().toLowerCase())));
        
        verify(taskService).getTaskById(1L);
    }
    
    @Test
    @WithMockUser
    void testGetTaskByIdNotFound() throws Exception {
        when(taskService.getTaskById(99L)).thenReturn(Optional.empty());
        
        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound());
        
        verify(taskService).getTaskById(99L);
    }
    
    @Test
    @WithMockUser
    void testGetAllTasksByUser() throws Exception {
        List<Task> tasks = Arrays.asList(task1, task2);
        
        when(taskService.getAllTasksByUser(1L)).thenReturn(tasks);
        when(taskService.convertToDto(any(Task.class))).thenCallRealMethod();
        
        mockMvc.perform(get("/api/tasks/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is(task1.getTitle())))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].title", is(task2.getTitle())));
        
        verify(taskService).getAllTasksByUser(1L);
    }
    
    @Test
    @WithMockUser
    void testGetTasksByUserAndStatus() throws Exception {
        List<Task> tasks = List.of(task1);
        
        when(taskService.getTasksByUserAndStatus(eq(1L), eq(Task.Status.TODO))).thenReturn(tasks);
        when(taskService.convertToDto(any(Task.class))).thenCallRealMethod();
        
        mockMvc.perform(get("/api/tasks/user/1/status/todo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is(task1.getTitle())))
                .andExpect(jsonPath("$[0].status", is("todo")));
        
        verify(taskService).getTasksByUserAndStatus(eq(1L), eq(Task.Status.TODO));
    }
    
    @Test
    @WithMockUser
    void testUpdateTask() throws Exception {
        TaskDto updateDto = new TaskDto();
        updateDto.setTitle("Updated Task");
        updateDto.setDescription("Updated description");
        updateDto.setStatus("completed");
        updateDto.setPriority("high");
        updateDto.setCategory("personal");
        updateDto.setDueDate(LocalDate.now().plusDays(5));
        
        Task updatedTask = new Task();
        updatedTask.setId(1L);
        updatedTask.setTitle(updateDto.getTitle());
        updatedTask.setDescription(updateDto.getDescription());
        updatedTask.setStatus(Task.Status.COMPLETED);
        updatedTask.setPriority(Task.Priority.HIGH);
        updatedTask.setCategory(Task.Category.PERSONAL);
        updatedTask.setDueDate(updateDto.getDueDate());
        updatedTask.setCompletedAt(LocalDateTime.now());
        updatedTask.setUser(user);
        
        when(taskService.updateTask(eq(1L), any(TaskDto.class))).thenReturn(updatedTask);
        when(taskService.convertToDto(updatedTask)).thenCallRealMethod();
        
        mockMvc.perform(put("/api/tasks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is(updateDto.getTitle())))
                .andExpect(jsonPath("$.description", is(updateDto.getDescription())))
                .andExpect(jsonPath("$.status", is("completed")))
                .andExpect(jsonPath("$.priority", is("high")))
                .andExpect(jsonPath("$.category", is("personal")));
        
        verify(taskService).updateTask(eq(1L), any(TaskDto.class));
    }
    
    @Test
    @WithMockUser
    void testDeleteTask() throws Exception {
        doNothing().when(taskService).deleteTask(1L);
        
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
        
        verify(taskService).deleteTask(1L);
    }
}
