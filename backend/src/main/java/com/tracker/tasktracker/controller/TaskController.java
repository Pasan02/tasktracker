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
        Task createdTask = taskService.createTask(taskDto, userId);
        return new ResponseEntity<>(taskService.convertToDto(createdTask), HttpStatus.CREATED);
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
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto taskDto) {
        Task updatedTask = taskService.updateTask(id, taskDto);
        return ResponseEntity.ok(taskService.convertToDto(updatedTask));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}