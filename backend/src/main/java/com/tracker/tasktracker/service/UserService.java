package com.tracker.tasktracker.service;

import java.util.Optional;

import com.tracker.tasktracker.dto.UpdateProfileRequest;
import com.tracker.tasktracker.dto.UserDto;
import com.tracker.tasktracker.model.User;

public interface UserService {
    Optional<User> getUserById(Long id);
    
    Optional<User> getUserByEmail(String email);
    
    UserDto convertToDto(User user);
    
    User registerUser(String firstName, String lastName, String email, String password);
    
    boolean existsByEmail(String email);
    
    User saveUser(User user);
    
    User updateUserProfile(Long userId, UpdateProfileRequest updateRequest);
    
    boolean updatePassword(Long userId, String currentPassword, String newPassword);
}