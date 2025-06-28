package com.tracker.tasktracker.service;

import com.tracker.tasktracker.dto.TaskDto;
import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.repository.TaskRepository;
import com.tracker.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Task createTask(TaskDto taskDto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Task task = convertToEntity(taskDto);
        task.setUser(user);
        task.setCreatedAt(LocalDateTime.now());
        
        return taskRepository.save(task);
    }
    
    public Optional<Task> getTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }
    
    public List<Task> getAllTasksByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return taskRepository.findByUser(user);
    }
    
    public List<Task> getTasksByUserAndStatus(Long userId, Task.Status status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return taskRepository.findByUserAndStatus(user, status);
    }
    
    public List<Task> getTasksByUserAndDueDate(Long userId, LocalDate dueDate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return taskRepository.findByUserAndDueDate(user, dueDate);
    }
    
    public List<Task> getUpcomingTasks(Long userId, int days) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        
        return taskRepository.findByUserAndDueDateBetween(user, today, endDate);
    }
    
    public List<Task> getOverdueTasks(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        LocalDate today = LocalDate.now();
        
        return taskRepository.findByUserAndDueDateLessThanEqualAndStatusNot(
                user, today, Task.Status.COMPLETED);
    }
    
    public Task updateTask(Long taskId, TaskDto taskDto) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        if (taskDto.getTitle() != null) {
            task.setTitle(taskDto.getTitle());
        }
        
        if (taskDto.getDescription() != null) {
            task.setDescription(taskDto.getDescription());
        }
        
        if (taskDto.getStatus() != null) {
            Task.Status newStatus = Task.Status.valueOf(taskDto.getStatus().toUpperCase());
            // If task is being marked as completed, set completedAt timestamp
            if (newStatus == Task.Status.COMPLETED && task.getStatus() != Task.Status.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
            } 
            // If task is being unmarked as completed, clear completedAt timestamp
            else if (newStatus != Task.Status.COMPLETED && task.getStatus() == Task.Status.COMPLETED) {
                task.setCompletedAt(null);
            }
            task.setStatus(newStatus);
        }
        
        if (taskDto.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(taskDto.getPriority().toUpperCase()));
        }
        
        if (taskDto.getCategory() != null) {
            task.setCategory(Task.Category.valueOf(taskDto.getCategory().toUpperCase()));
        }
        
        if (taskDto.getDueDate() != null) {
            task.setDueDate(taskDto.getDueDate());
        }
        
        if (taskDto.getDueTime() != null) {
            task.setDueTime(taskDto.getDueTime());
        }
        
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("Task not found");
        }
        
        taskRepository.deleteById(taskId);
    }
    
    public TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus().name().toLowerCase());
        dto.setPriority(task.getPriority().name().toLowerCase());
        dto.setCategory(task.getCategory().name().toLowerCase());
        dto.setDueDate(task.getDueDate());
        dto.setDueTime(task.getDueTime());
        return dto;
    }
    
    public Task convertToEntity(TaskDto dto) {
        Task task = new Task();
        
        if (dto.getId() != null) {
            task.setId(dto.getId());
        }
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        
        // Set default values if not provided
        Task.Status status = dto.getStatus() != null 
            ? Task.Status.valueOf(dto.getStatus().toUpperCase()) 
            : Task.Status.TODO;
        task.setStatus(status);
        
        Task.Priority priority = dto.getPriority() != null 
            ? Task.Priority.valueOf(dto.getPriority().toUpperCase()) 
            : Task.Priority.MEDIUM;
        task.setPriority(priority);
        
        Task.Category category = dto.getCategory() != null 
            ? Task.Category.valueOf(dto.getCategory().toUpperCase()) 
            : Task.Category.WORK;
        task.setCategory(category);
        
        task.setDueDate(dto.getDueDate());
        task.setDueTime(dto.getDueTime());
        
        return task;
    }
}