package com.tracker.tasktracker.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tracker.tasktracker.dto.UpdateProfileRequest;
import com.tracker.tasktracker.dto.UserDto;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public UserDto convertToDto(User user) {
        return new UserDto(user);
    }
    
    @Override
    public User registerUser(String firstName, String lastName, String email, String password) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    @Override
    public User updateUserProfile(Long userId, UpdateProfileRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (updateRequest.getFirstName() != null) {
                user.setFirstName(updateRequest.getFirstName());
            }
            
            if (updateRequest.getLastName() != null) {
                user.setLastName(updateRequest.getLastName());
            }
            
            if (updateRequest.getPhone() != null) {
                user.setPhone(updateRequest.getPhone());
            }
            
            if (updateRequest.getLocation() != null) {
                user.setLocation(updateRequest.getLocation());
            }
            
            if (updateRequest.getAvatar() != null) {
                user.setAvatar(updateRequest.getAvatar());
            }
            
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    @Override
    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (passwordEncoder.matches(currentPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
}