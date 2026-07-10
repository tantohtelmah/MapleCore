package com.maplecore.banking.customer.service;

import com.maplecore.banking.common.entity.Address;
import com.maplecore.banking.common.exception.InvalidTransactionException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.customer.dto.*;
import com.maplecore.banking.customer.entity.*;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.customer.repository.KycRecordRepository;
import com.maplecore.banking.user.entity.User;
import com.maplecore.banking.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private KycRecordRepository kycRecordRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerService customerService;

    private User testUser;
    private Customer testCustomer;
    private Address testAddress;

    @BeforeEach
    void setUp() {
        testUser = User.builder().email("john.doe@maple.ca").active(true).build();
        testUser.setId(1L);

        testAddress = new Address("123 Maple St", "Ottawa", "ON", "K1A 0B1", "Canada");

        testCustomer = Customer.builder()
                .user(testUser)
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("6135550199")
                .address(testAddress)
                .status(CustomerStatus.PENDING_KYC)
                .build();
        testCustomer.setId(10L);
    }

    @Test
    void whenProfileDoesNotExist_thenGetProfileThrowsNotFound() {
        Mockito.when(customerRepository.findByUserEmail(any(String.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getProfile("missing@maple.ca"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer profile not created yet.");
    }

    @Test
    void whenProfileExists_thenGetProfileReturnsResponse() {
        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));
        Mockito.when(kycRecordRepository.findByCustomerId(10L)).thenReturn(Optional.empty());

        CustomerProfileResponse response = customerService.getProfile("john.doe@maple.ca");

        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(response.kycStatus()).isEqualTo("NOT_STARTED");
    }

    @Test
    void whenUpdatingProfileFirstTime_thenCreatesCustomerProfile() {
        UpdateProfileRequest request = new UpdateProfileRequest("John", "Doe", "6135550199", testAddress);

        Mockito.when(userRepository.findByEmail("john.doe@maple.ca")).thenReturn(Optional.of(testUser));
        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.empty());
        Mockito.when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        CustomerProfileResponse response = customerService.updateProfile("john.doe@maple.ca", request);

        assertThat(response.customerId()).isEqualTo(10L);
        assertThat(response.status()).isEqualTo("PENDING_KYC");
    }

    @Test
    void whenSubmittingKycAndAlreadyVerified_thenThrowsException() {
        KycSubmissionRequest request = new KycSubmissionRequest("PASSPORT", "AB123456");
        KycRecord verifiedKyc = KycRecord.builder().status(KycStatus.VERIFIED).build();

        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));
        Mockito.when(kycRecordRepository.findByCustomerId(10L)).thenReturn(Optional.of(verifiedKyc));

        assertThatThrownBy(() -> customerService.submitKyc("john.doe@maple.ca", request))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("already verified");
    }

    @Test
    void whenReviewingKycApproved_thenCustomerStatusBecomesActive() {
        KycReviewRequest reviewRequest = new KycReviewRequest(KycStatus.VERIFIED, "Verified successfully");
        KycRecord pendingKyc = KycRecord.builder().customer(testCustomer).status(KycStatus.PENDING_REVIEW).build();

        Mockito.when(customerRepository.findById(10L)).thenReturn(Optional.of(testCustomer));
        Mockito.when(kycRecordRepository.findByCustomerId(10L)).thenReturn(Optional.of(pendingKyc));

        customerService.reviewKyc(10L, reviewRequest, "reviewer@maple.ca");

        assertThat(testCustomer.getStatus()).isEqualTo(CustomerStatus.ACTIVE);
        assertThat(pendingKyc.getStatus()).isEqualTo(KycStatus.VERIFIED);
        assertThat(pendingKyc.getReviewedBy()).isEqualTo("reviewer@maple.ca");
    }
}
