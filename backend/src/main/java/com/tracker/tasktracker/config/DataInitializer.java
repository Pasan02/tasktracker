package com.tracker.tasktracker.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.tracker.tasktracker.model.Habit;
import com.tracker.tasktracker.model.Task;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.repository.HabitRepository;
import com.tracker.tasktracker.repository.TaskRepository;
import com.tracker.tasktracker.repository.UserRepository;

@Configuration
@Profile("dev") // Only run in dev profile
public class DataInitializer {

    @Bean
    @SuppressWarnings("unused")
    CommandLineRunner initDatabase(UserRepository userRepository,
                                  TaskRepository taskRepository,
                                  HabitRepository habitRepository,
                                  PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if test user already exists to avoid duplicate entry errors
            if (!userRepository.existsByEmail("john.doe@example.com")) {
                // Create test user
                User user = new User();
                user.setFirstName("John");
                user.setLastName("Doe");
                user.setEmail("john.doe@example.com");
                user.setPassword(passwordEncoder.encode("password123"));
                user.setCreatedAt(LocalDateTime.now());
                userRepository.save(user);

                // Create test tasks
                Task task1 = new Task();
                task1.setTitle("Complete project proposal");
                task1.setDescription("Finish drafting the Q4 project proposal");
                task1.setStatus(Task.Status.TODO);
                task1.setPriority(Task.Priority.HIGH);
                task1.setCategory(Task.Category.WORK);
                task1.setDueDate(LocalDate.now().plusDays(2));
                task1.setDueTime(LocalTime.of(17, 0));
                task1.setCreatedAt(LocalDateTime.now());
                task1.setUser(user);
                taskRepository.save(task1);

                // Create test habit
                Habit habit1 = new Habit();
                habit1.setTitle("Morning Meditation");
                habit1.setDescription("15 minutes meditation every morning");
                habit1.setFrequency(Habit.Frequency.DAILY);
                habit1.setTargetDays(Set.of(0, 1, 2, 3, 4, 5, 6)); // All days
                habit1.setCategory(Habit.Category.PERSONAL);
                habit1.setCreatedAt(LocalDateTime.now());
                habit1.setActive(true);
                habit1.setUser(user);
                habitRepository.save(habit1);
            }
        };
    }
}
