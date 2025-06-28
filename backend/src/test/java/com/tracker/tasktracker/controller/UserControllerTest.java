package com.tracker.tasktracker.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracker.tasktracker.dto.UserDto;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.service.UserService;

@SpringBootTest
@Disabled("Temporarily disabled while focusing on frontend development")
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;
    private User user;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        objectMapper = new ObjectMapper();

        user = new User();
        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password");
        user.setCreatedAt(LocalDateTime.now());

        userDto = new UserDto();
        userDto.setId(1L);
        userDto.setFirstName("John");
        userDto.setLastName("Doe");
        userDto.setEmail("john.doe@example.com");
    }

    @Test
    @WithMockUser
    void testGetUserById() throws Exception {
        when(userService.getUserById(1L)).thenReturn(Optional.of(user));
        when(userService.convertToDto(user)).thenReturn(userDto);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")))
                .andExpect(jsonPath("$.email", is("john.doe@example.com")));

        verify(userService).getUserById(1L);
    }

    @Test
    @WithMockUser
    void testGetUserByIdNotFound() throws Exception {
        when(userService.getUserById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound());

        verify(userService).getUserById(99L);
    }

    @Test
    @WithMockUser
    void testUpdateUserProfile() throws Exception {
        Map<String, String> profileDetails = new HashMap<>();
        profileDetails.put("firstName", "UpdatedFirstName");
        profileDetails.put("lastName", "UpdatedLastName");
        profileDetails.put("avatar", "profile.jpg");

        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setFirstName("UpdatedFirstName");
        updatedUser.setLastName("UpdatedLastName");
        updatedUser.setEmail("john.doe@example.com");
        updatedUser.setAvatar("profile.jpg");

        UserDto updatedUserDto = new UserDto();
        updatedUserDto.setId(1L);
        updatedUserDto.setFirstName("UpdatedFirstName");
        updatedUserDto.setLastName("UpdatedLastName");
        updatedUserDto.setEmail("john.doe@example.com");

        when(userService.updateUserProfile(anyLong(), anyString(), anyString(), anyString())).thenReturn(updatedUser);
        when(userService.convertToDto(updatedUser)).thenReturn(updatedUserDto);

        mockMvc.perform(put("/api/users/1/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("UpdatedFirstName")))
                .andExpect(jsonPath("$.lastName", is("UpdatedLastName")));

        verify(userService).updateUserProfile(1L, "UpdatedFirstName", "UpdatedLastName", "profile.jpg");
    }

    @Test
    @WithMockUser
    void testUpdatePassword() throws Exception {
        Map<String, String> passwordDetails = new HashMap<>();
        passwordDetails.put("currentPassword", "oldPassword");
        passwordDetails.put("newPassword", "newPassword");

        when(userService.updatePassword(1L, "oldPassword", "newPassword")).thenReturn(true);

        mockMvc.perform(put("/api/users/1/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password updated successfully")));

        verify(userService).updatePassword(1L, "oldPassword", "newPassword");
    }

    @Test
    @WithMockUser
    void testUpdatePasswordInvalidCurrent() throws Exception {
        Map<String, String> passwordDetails = new HashMap<>();
        passwordDetails.put("currentPassword", "wrongPassword");
        passwordDetails.put("newPassword", "newPassword");

        when(userService.updatePassword(1L, "wrongPassword", "newPassword")).thenReturn(false);

        mockMvc.perform(put("/api/users/1/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordDetails)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$", is("Current password is incorrect")));

        verify(userService).updatePassword(1L, "wrongPassword", "newPassword");
    }
}
