package com.tracker.tasktracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracker.tasktracker.dto.LoginRequest;
import com.tracker.tasktracker.dto.RegisterRequest;
import com.tracker.tasktracker.dto.UserDto;
import com.tracker.tasktracker.model.User;
import com.tracker.tasktracker.security.jwt.JwtTokenProvider;
import com.tracker.tasktracker.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Disabled("Temporarily disabled while focusing on frontend development")
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;
    
    private ObjectMapper objectMapper;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testLoginSuccess() throws Exception {
        // Setup
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(), loginRequest.getPassword());

        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");

        UserDto userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("test@example.com");
        userDto.setFirstName("Test");
        userDto.setLastName("User");

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(authentication)).thenReturn("test-jwt-token");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userService.convertToDto(user)).thenReturn(userDto);

        // Execute & Verify
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("test-jwt-token")))
                .andExpect(jsonPath("$.user.id", is(1)))
                .andExpect(jsonPath("$.user.email", is("test@example.com")));
    }

    @Test
    void testLoginFailure() throws Exception {
        // Setup
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrong-password");

        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // Execute & Verify
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void testRegisterSuccess() throws Exception {
        // Setup
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("New");
        registerRequest.setLastName("User");
        registerRequest.setEmail("new@example.com");
        registerRequest.setPassword("password");

        User user = new User();
        user.setId(1L);
        user.setFirstName("New");
        user.setLastName("User");
        user.setEmail("new@example.com");

        UserDto userDto = new UserDto();
        userDto.setId(1L);
        userDto.setFirstName("New");
        userDto.setLastName("User");
        userDto.setEmail("new@example.com");

        when(userService.getUserByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userService.registerUser(
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                registerRequest.getEmail(),
                registerRequest.getPassword()
        )).thenReturn(user);
        when(userService.convertToDto(user)).thenReturn(userDto);

        // Execute & Verify
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.firstName", is("New")))
                .andExpect(jsonPath("$.lastName", is("User")))
                .andExpect(jsonPath("$.email", is("new@example.com")));
    }

    @Test
    void testRegisterEmailExists() throws Exception {
        // Setup
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Existing");
        registerRequest.setLastName("User");
        registerRequest.setEmail("existing@example.com");
        registerRequest.setPassword("password");

        User existingUser = new User();
        existingUser.setEmail("existing@example.com");

        when(userService.getUserByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        // Execute & Verify
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Email is already in use")));
    }

    @Test
    void testValidateTokenSuccess() throws Exception {
        // Setup
        String token = "valid-token";
        
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");

        UserDto userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("test@example.com");
        userDto.setFirstName("Test");
        userDto.setLastName("User");

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getUserEmailFromToken(token)).thenReturn("test@example.com");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userService.convertToDto(user)).thenReturn(userDto);

        // Execute & Verify
        mockMvc.perform(get("/api/auth/validate")
                .param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.user.id", is(1)))
                .andExpect(jsonPath("$.user.email", is("test@example.com")));
    }

    @Test
    void testValidateTokenInvalid() throws Exception {
        // Setup
        String token = "invalid-token";
        
        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        // Execute & Verify
        mockMvc.perform(get("/api/auth/validate")
                .param("token", token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid or expired token")));
    }
}
