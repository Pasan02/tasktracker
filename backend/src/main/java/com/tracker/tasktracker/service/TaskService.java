package com.tracker.tasktracker.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tracker.tasktracker.dto.TaskDto;
import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.repository.TaskRepository;
import com.tracker.tasktracker.repository.UserRepository;

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
        System.out.println("=== SERVICE UPDATE START ===");
        System.out.println("Updating task " + taskId + " with data: " + taskDto);
        
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));
        
        System.out.println("Current task: " + task);
        System.out.println("Current task status: " + task.getStatus());
        
        // Handle status update first since it's causing issues
        if (taskDto.getStatus() != null && !taskDto.getStatus().trim().isEmpty()) {
            String statusStr = taskDto.getStatus().trim().toUpperCase();
            System.out.println("Processing status update: '" + taskDto.getStatus() + "' -> '" + statusStr + "'");
            
            try {
                // Validate status value
                if (!statusStr.equals("TODO") && !statusStr.equals("COMPLETED")) {
                    throw new IllegalArgumentException("Invalid status '" + statusStr + "'. Valid values are: TODO, COMPLETED");
                }
                
                Task.Status newStatus = Task.Status.valueOf(statusStr);
                System.out.println("Updating status from " + task.getStatus() + " to " + newStatus);
                
                // Handle completion timestamp
                if (newStatus == Task.Status.COMPLETED && task.getStatus() != Task.Status.COMPLETED) {
                    task.setCompletedAt(LocalDateTime.now());
                    System.out.println("Task marked as completed at: " + task.getCompletedAt());
                } else if (newStatus == Task.Status.TODO && task.getStatus() == Task.Status.COMPLETED) {
                    task.setCompletedAt(null);
                    System.out.println("Task unmarked as completed");
                }
                task.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid status: " + taskDto.getStatus());
                throw new IllegalArgumentException("Invalid status '" + taskDto.getStatus() + "'. Valid values are: TODO, COMPLETED");
            }
        }
        
        // Only update other fields if they are not null and not empty
        if (taskDto.getTitle() != null && !taskDto.getTitle().trim().isEmpty()) {
            System.out.println("Updating title: " + task.getTitle() + " -> " + taskDto.getTitle());
            task.setTitle(taskDto.getTitle());
        }
        
        if (taskDto.getDescription() != null) {
            System.out.println("Updating description");
            task.setDescription(taskDto.getDescription());
        }
        
        if (taskDto.getPriority() != null && !taskDto.getPriority().trim().isEmpty()) {
            try {
                task.setPriority(Task.Priority.valueOf(taskDto.getPriority().toUpperCase()));
                System.out.println("Updated priority to: " + taskDto.getPriority());
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid priority: " + taskDto.getPriority());
                throw new IllegalArgumentException("Invalid priority '" + taskDto.getPriority() + "'");
            }
        }
        
        if (taskDto.getCategory() != null && !taskDto.getCategory().trim().isEmpty()) {
            try {
                task.setCategory(Task.Category.valueOf(taskDto.getCategory().toUpperCase()));
                System.out.println("Updated category to: " + taskDto.getCategory());
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid category: " + taskDto.getCategory());
                throw new IllegalArgumentException("Invalid category '" + taskDto.getCategory() + "'");
            }
        }
        
        if (taskDto.getDueDate() != null) {
            task.setDueDate(taskDto.getDueDate());
            System.out.println("Updated due date to: " + taskDto.getDueDate());
        }
        
        if (taskDto.getDueTime() != null) {
            task.setDueTime(taskDto.getDueTime());
            System.out.println("Updated due time to: " + taskDto.getDueTime());
        }
        
        try {
            Task savedTask = taskRepository.save(task);
            System.out.println("=== SERVICE UPDATE SUCCESS ===");
            System.out.println("Task saved successfully with status: " + savedTask.getStatus());
            System.out.println("Final task: " + savedTask);
            System.out.println("==============================");
            return savedTask;
        } catch (Exception e) {
            System.err.println("Error saving task to database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save task to database", e);
        }
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
    
    private Task convertToEntity(TaskDto taskDto) {
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        
        // Only allow TODO or COMPLETED status
        String status = taskDto.getStatus() != null ? taskDto.getStatus().toUpperCase() : "TODO";
        if (!status.equals("TODO") && !status.equals("COMPLETED")) {
            throw new IllegalArgumentException("Status must be either TODO or COMPLETED, got: " + status);
        }
        task.setStatus(Task.Status.valueOf(status));
        
        task.setPriority(Task.Priority.valueOf(taskDto.getPriority().toUpperCase()));
        task.setCategory(Task.Category.valueOf(taskDto.getCategory().toUpperCase()));
        task.setDueDate(taskDto.getDueDate());
        task.setDueTime(taskDto.getDueTime());
        return task;
    }
}