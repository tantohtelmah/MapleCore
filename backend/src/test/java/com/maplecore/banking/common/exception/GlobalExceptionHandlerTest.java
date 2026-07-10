package com.maplecore.banking.common.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maplecore.banking.common.dto.ErrorResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void whenResourceNotFound_thenReturns404AndCorrectBody() throws Exception {
        String responseContent = mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse errorResponse = objectMapper.readValue(responseContent, ErrorResponse.class);
        assertThat(errorResponse.status()).isEqualTo(404);
        assertThat(errorResponse.error()).isEqualTo("RESOURCE_NOT_FOUND");
        assertThat(errorResponse.message()).isEqualTo("Resource was not found");
        assertThat(errorResponse.path()).isEqualTo("/test/not-found");
        assertThat(errorResponse.correlationId()).isNotBlank();
    }

    @Test
    void whenInsufficientFunds_thenReturns400AndCorrectBody() throws Exception {
        String responseContent = mockMvc.perform(get("/test/insufficient-funds"))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse errorResponse = objectMapper.readValue(responseContent, ErrorResponse.class);
        assertThat(errorResponse.status()).isEqualTo(400);
        assertThat(errorResponse.error()).isEqualTo("INSUFFICIENT_FUNDS");
        assertThat(errorResponse.message()).isEqualTo("Balance is too low");
    }

    @Test
    void whenValidationFails_thenReturns400WithFieldErrors() throws Exception {
        TestRequest request = new TestRequest(""); // blank field to trigger validation error
        
        String responseContent = mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse errorResponse = objectMapper.readValue(responseContent, ErrorResponse.class);
        assertThat(errorResponse.status()).isEqualTo(400);
        assertThat(errorResponse.error()).isEqualTo("VALIDATION_ERROR");
        assertThat(errorResponse.fieldErrors()).containsKey("name");
        assertThat(errorResponse.fieldErrors().get("name")).isEqualTo("Name is required");
    }

    // Mock controller for testing Exception Handler mappings
    @RestController
    private static class TestController {

        @GetMapping("/test/not-found")
        public void throwNotFound() {
            throw new ResourceNotFoundException("Resource was not found");
        }

        @GetMapping("/test/insufficient-funds")
        public void throwInsufficientFunds() {
            throw new InsufficientFundsException("Balance is too low");
        }

        @PostMapping("/test/validate")
        public void validateRequest(@Valid @RequestBody TestRequest request) {
            // Method body left empty
        }
    }

    private static class TestRequest {
        @NotBlank(message = "Name is required")
        private String name;

        public TestRequest() {}

        public TestRequest(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
