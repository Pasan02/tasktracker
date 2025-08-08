package com.tracker.tasktracker.controller;

import com.tracker.tasktracker.dto.TaskDto;
import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173") // React dev server port
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, @RequestParam Long userId) {
        try {
            System.out.println("Creating task for user " + userId + ": " + taskDto);
            Task createdTask = taskService.createTask(taskDto, userId);
            TaskDto responseDto = taskService.convertToDto(createdTask);
            return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Error creating task: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Unexpected error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(value -> ResponseEntity.ok(taskService.convertToDto(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDto>> getAllTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = taskService.getAllTasksByUser(userId);
        List<TaskDto> taskDtos = tasks.stream()
                .map(taskService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDtos);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByUserAndStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        Task.Status taskStatus = Task.Status.valueOf(status.toUpperCase());
        List<Task> tasks = taskService.getTasksByUserAndStatus(userId, taskStatus);
        List<TaskDto> taskDtos = tasks.stream()
                .map(taskService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDtos);
    }

    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<TaskDto>> getTasksByUserAndDueDate(
            @PathVariable Long userId,
            @PathVariable String date) {
        LocalDate dueDate = LocalDate.parse(date);
        List<Task> tasks = taskService.getTasksByUserAndDueDate(userId, dueDate);
        List<TaskDto> taskDtos = tasks.stream()
                .map(taskService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDtos);
    }

    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<TaskDto>> getUpcomingTasks(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int days) {
        List<Task> tasks = taskService.getUpcomingTasks(userId, days);
        List<TaskDto> taskDtos = tasks.stream()
                .map(taskService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDtos);
    }

    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<List<TaskDto>> getOverdueTasks(@PathVariable Long userId) {
        List<Task> tasks = taskService.getOverdueTasks(userId);
        List<TaskDto> taskDtos = tasks.stream()
                .map(taskService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDto taskDto) { // Remove @Valid to avoid validation issues
        try {
            System.out.println("=== TASK UPDATE REQUEST ===");
            System.out.println("Task ID: " + id + " (Type: " + id.getClass().getSimpleName() + ")");
            System.out.println("Request Body: " + taskDto);
            System.out.println("Status field: '" + taskDto.getStatus() + "'");
            System.out.println("===========================");
            
            // Validate task exists before updating
            Optional<Task> existingTask = taskService.getTaskById(id);
            if (existingTask.isEmpty()) {
                System.err.println("Task not found with ID: " + id);
                return ResponseEntity.notFound()
                        .build();
            }
            
            Task updatedTask = taskService.updateTask(id, taskDto);
            TaskDto responseDto = taskService.convertToDto(updatedTask);
            
            System.out.println("=== UPDATE SUCCESS ===");
            System.out.println("Updated task: " + responseDto);
            System.out.println("======================");
            
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            System.err.println("=== VALIDATION ERROR ===");
            System.err.println("Task ID: " + id);
            System.err.println("Error: " + e.getMessage());
            System.err.println("Request DTO: " + taskDto);
            System.err.println("========================");
            
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "Validation error", 
                        "message", e.getMessage(),
                        "taskId", id.toString(),
                        "receivedData", taskDto.toString()
                    ));
        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR ===");
            System.err.println("Task ID: " + id);
            System.err.println("Error: " + e.getMessage());
            System.err.println("Request DTO: " + taskDto);
            e.printStackTrace();
            System.err.println("========================");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Internal server error", 
                        "message", e.getMessage(),
                        "taskId", id.toString()
                    ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}