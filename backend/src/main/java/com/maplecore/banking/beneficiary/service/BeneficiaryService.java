package com.maplecore.banking.beneficiary.service;

import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.beneficiary.dto.BeneficiaryRequest;
import com.maplecore.banking.beneficiary.dto.BeneficiaryResponse;
import com.maplecore.banking.beneficiary.entity.Beneficiary;
import com.maplecore.banking.beneficiary.repository.BeneficiaryRepository;
import com.maplecore.banking.common.exception.DuplicateRequestException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.common.exception.UnauthorizedAccessException;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                              CustomerRepository customerRepository,
                              AccountRepository accountRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(String email, BeneficiaryRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

        // Validate destination account exists in MapleCore
        accountRepository.findByAccountNumber(request.accountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination bank account number does not exist."));

        if (beneficiaryRepository.existsByCustomerIdAndAccountNumber(customer.getId(), request.accountNumber())) {
            throw new DuplicateRequestException("Beneficiary already exists on your payee list.");
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .customer(customer)
                .name(request.name())
                .accountNumber(request.accountNumber())
                .nickname(request.nickname())
                .build();

        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);
        return mapToResponse(savedBeneficiary);
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(String email) {
        return beneficiaryRepository.findByCustomerUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryResponse updateNickname(String email, Long id, String nickname) {
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found."));

        if (!beneficiary.getCustomer().getUser().getEmail().equals(email)) {
            throw new UnauthorizedAccessException("You are not authorized to modify this beneficiary.");
        }

        beneficiary.setNickname(nickname);
        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);
        return mapToResponse(savedBeneficiary);
    }

    @Transactional
    public void deleteBeneficiary(String email, Long id) {
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found."));

        if (!beneficiary.getCustomer().getUser().getEmail().equals(email)) {
            throw new UnauthorizedAccessException("You are not authorized to remove this beneficiary.");
        }

        beneficiaryRepository.delete(beneficiary);
    }

    private BeneficiaryResponse mapToResponse(Beneficiary beneficiary) {
        String rawNo = beneficiary.getAccountNumber();
        String maskedNo = rawNo.length() >= 4 ? "******" + rawNo.substring(rawNo.length() - 4) : "******";
        return new BeneficiaryResponse(
                beneficiary.getId(),
                beneficiary.getName(),
                maskedNo,
                rawNo,
                beneficiary.getNickname()
        );
    }
}
