package com.maplecore.banking.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maplecore.banking.auth.dto.*;
import com.maplecore.banking.auth.service.AuthService;
import com.maplecore.banking.auth.service.CustomUserDetailsService;
import com.maplecore.banking.auth.service.JwtService;
import com.maplecore.banking.user.entity.Role;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable spring filters for direct controller unit testing
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void whenRegisteringValidCustomer_thenReturns201AndAuthResponse() throws Exception {
        RegisterRequest request = new RegisterRequest("jane.doe@maple.ca", "securepassword123", Set.of(Role.CUSTOMER));
        AuthResponse response = new AuthResponse("access-token", "refresh-token", 1L, "jane.doe@maple.ca", Set.of("CUSTOMER"));

        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("jane.doe@maple.ca"));
    }

    @Test
    void whenRegisteringWithShortPassword_thenReturns400ValidationError() throws Exception {
        RegisterRequest request = new RegisterRequest("jane.doe@maple.ca", "short", Set.of(Role.CUSTOMER));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void whenLoggingInWithValidCredentials_thenReturns200AndTokens() throws Exception {
        LoginRequest request = new LoginRequest("user@maple.ca", "password123");
        AuthResponse response = new AuthResponse("access-token", "refresh-token", 2L, "user@maple.ca", Set.of("CUSTOMER"));

        Mockito.when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.email").value("user@maple.ca"));
    }

    @Test
    void whenRefreshingToken_thenReturnsNewTokens() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest("valid-refresh-token");
        TokenRefreshResponse response = new TokenRefreshResponse("new-access-token", "new-refresh-token");

        Mockito.when(authService.refreshToken(any(TokenRefreshRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
    }
}
