package com.tracker.tasktracker.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tracker.tasktracker.dto.UpdateProfileRequest;
import com.tracker.tasktracker.dto.UserDto;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;
    
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isPresent()) {
            UserDto userDto = userService.convertToDto(userOpt.get());
            return ResponseEntity.ok(userDto);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        try {
            // Enhanced debugging
            System.out.println("Profile update request received for user: " + userId);
            System.out.println("Request data: " + updateRequest);
            
            // Verify this is the current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(email);
            
            if (userOpt.isEmpty() || !userOpt.get().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only update your own profile"));
            }
            
            User updatedUser = userService.updateUserProfile(userId, updateRequest);
            UserDto userDto = userService.convertToDto(updatedUser);
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            // Print full stack trace for debugging
            System.err.println("Error updating profile for user " + userId);
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{userId}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> passwords) {
        try {
            // Log the request for debugging
            System.out.println("Password update request for user: " + userId);
            System.out.println("Request body: " + passwords);
            
            // Verify this is the current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(email);
            
            if (userOpt.isEmpty() || !userOpt.get().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only update your own password"));
            }
            
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Current password and new password are required"));
            }
            
            boolean updated = userService.updatePassword(userId, currentPassword, newPassword);
            
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Current password is incorrect"));
            }
        } catch (Exception e) {
            // Log the full exception stack trace
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to update password: " + e.getMessage()));
        }
    }
}