package com.maplecore.banking.customer.service;

import com.maplecore.banking.common.exception.InvalidTransactionException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.customer.dto.*;
import com.maplecore.banking.customer.entity.*;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.customer.repository.KycRecordRepository;
import com.maplecore.banking.user.entity.User;
import com.maplecore.banking.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final KycRecordRepository kycRecordRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository,
                           KycRecordRepository kycRecordRepository,
                           UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.kycRecordRepository = kycRecordRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not created yet."));

        String kycStatus = kycRecordRepository.findByCustomerId(customer.getId())
                .map(record -> record.getStatus().name())
                .orElse("NOT_STARTED");

        return mapToResponse(customer, kycStatus);
    }

    @Transactional
    public CustomerProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found."));

        Customer customer = customerRepository.findByUserEmail(email)
                .orElseGet(() -> Customer.builder()
                        .user(user)
                        .status(CustomerStatus.PENDING_KYC)
                        .build());

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setAddress(request.address());

        Customer savedCustomer = customerRepository.save(customer);

        String kycStatus = kycRecordRepository.findByCustomerId(savedCustomer.getId())
                .map(record -> record.getStatus().name())
                .orElse("NOT_STARTED");

        return mapToResponse(savedCustomer, kycStatus);
    }

    @Transactional
    public void submitKyc(String email, KycSubmissionRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Complete profile details before submitting KYC."));

        Optional<KycRecord> existingKyc = kycRecordRepository.findByCustomerId(customer.getId());
        if (existingKyc.isPresent()) {
            KycStatus status = existingKyc.get().getStatus();
            if (status == KycStatus.VERIFIED) {
                throw new InvalidTransactionException("Identity verification (KYC) is already verified.");
            }
            if (status == KycStatus.PENDING_REVIEW) {
                throw new InvalidTransactionException("Identity verification (KYC) is currently pending review.");
            }
        }

        KycRecord kycRecord = existingKyc.orElseGet(() -> KycRecord.builder()
                .customer(customer)
                .build());

        kycRecord.setDocumentType(request.documentType());
        kycRecord.setDocumentNumber(request.documentNumber());
        kycRecord.setStatus(KycStatus.PENDING_REVIEW);

        kycRecordRepository.save(kycRecord);

        // Update customer status to pending review
        customer.setStatus(CustomerStatus.PENDING_KYC);
        customerRepository.save(customer);
    }

    @Transactional
    public void reviewKyc(Long customerId, KycReviewRequest request, String reviewerEmail) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));

        KycRecord kycRecord = kycRecordRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("No active KYC submission found for this customer."));

        if (kycRecord.getStatus() != KycStatus.PENDING_REVIEW) {
            throw new InvalidTransactionException("This KYC application is not in PENDING_REVIEW status.");
        }

        kycRecord.setStatus(request.status());
        kycRecord.setReviewedAt(Instant.now());
        kycRecord.setReviewedBy(reviewerEmail);
        kycRecord.setNotes(request.notes());

        kycRecordRepository.save(kycRecord);

        // Transition customer statuses based on KYC outcome
        if (request.status() == KycStatus.VERIFIED) {
            customer.setStatus(CustomerStatus.ACTIVE);
        } else if (request.status() == KycStatus.REJECTED) {
            customer.setStatus(CustomerStatus.PENDING_KYC); // Reset to allow re-submission
        }

        customerRepository.save(customer);
    }

    @Transactional
    public void updateCustomerStatus(Long customerId, CustomerStatus status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
        customer.setStatus(status);
        customerRepository.save(customer);
    }

    private CustomerProfileResponse mapToResponse(Customer customer, String kycStatus) {
        return new CustomerProfileResponse(
                customer.getId(),
                customer.getUser().getId(),
                customer.getUser().getEmail(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getStatus().name(),
                kycStatus
        );
    }
}
