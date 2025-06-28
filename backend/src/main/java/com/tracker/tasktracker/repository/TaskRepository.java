
package com.tracker.tasktracker.repository;

import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);
    
    List<Task> findByUserAndDueDate(User user, LocalDate dueDate);
    
    List<Task> findByUserAndStatus(User user, Task.Status status);
    
    List<Task> findByUserOrderByDueDateAsc(User user);
    
    List<Task> findByUserAndDueDateBetween(User user, LocalDate start, LocalDate end);
    
    List<Task> findByUserAndDueDateLessThanEqualAndStatusNot(User user, LocalDate date, Task.Status status);
}