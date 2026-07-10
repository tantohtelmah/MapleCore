package com.maplecore.banking.configuration;

import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.entity.AccountType;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.beneficiary.entity.Beneficiary;
import com.maplecore.banking.beneficiary.repository.BeneficiaryRepository;
import com.maplecore.banking.common.entity.Address;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.entity.CustomerStatus;
import com.maplecore.banking.customer.entity.KycRecord;
import com.maplecore.banking.customer.entity.KycStatus;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.customer.repository.KycRecordRepository;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.entity.TransactionStatus;
import com.maplecore.banking.transaction.entity.TransactionType;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import com.maplecore.banking.user.entity.Role;
import com.maplecore.banking.user.entity.User;
import com.maplecore.banking.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final KycRecordRepository kycRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          CustomerRepository customerRepository,
                          AccountRepository accountRepository,
                          TransactionRepository transactionRepository,
                          BeneficiaryRepository beneficiaryRepository,
                          KycRecordRepository kycRecordRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.kycRecordRepository = kycRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialization seeder.");
            return;
        }

        log.info("Starting demo seeding database operations...");

        // 1. Seed Users
        User adminUser = User.builder()
                .email("admin@maplecore.ca")
                .password(passwordEncoder.encode("adminpassword123"))
                .roles(Set.of(Role.ROLE_ADMIN))
                .enabled(true)
                .build();
        userRepository.save(adminUser);

        User complianceUser = User.builder()
                .email("compliance@maplecore.ca")
                .password(passwordEncoder.encode("compliancepassword123"))
                .roles(Set.of(Role.ROLE_COMPLIANCE_OFFICER))
                .enabled(true)
                .build();
        userRepository.save(complianceUser);

        User employeeUser = User.builder()
                .email("employee@maplecore.ca")
                .password(passwordEncoder.encode("employeepassword123"))
                .roles(Set.of(Role.ROLE_BANK_EMPLOYEE))
                .enabled(true)
                .build();
        userRepository.save(employeeUser);

        User customerUser = User.builder()
                .email("customer@maplecore.ca")
                .password(passwordEncoder.encode("customerpassword123"))
                .roles(Set.of(Role.ROLE_CUSTOMER))
                .enabled(true)
                .build();
        userRepository.save(customerUser);

        // 2. Seed Customer details
        Address address = Address.builder()
                .streetAddress("100 University Ave")
                .city("Toronto")
                .province("ON")
                .postalCode("M5J 2H7")
                .build();

        Customer customer = Customer.builder()
                .user(customerUser)
                .firstName("Pierre")
                .lastName("Trudeau")
                .phoneNumber("+1 (416) 555-0199")
                .dateOfBirth(LocalDate.of(1975, 10, 18))
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.VERIFIED)
                .address(address)
                .build();
        customerRepository.save(customer);

        // Seed KYC record
        KycRecord kyc = KycRecord.builder()
                .customer(customer)
                .documentType("PASSPORT")
                .documentReferenceNumber("CAN-PP-90812")
                .kycStatus(KycStatus.VERIFIED)
                .notes("Passport matches official registries.")
                .build();
        kycRecordRepository.save(kyc);

        // 3. Seed Accounts
        Account chequing = Account.builder()
                .accountNumber("1004382910")
                .accountType(AccountType.CHEQUING)
                .balance(new BigDecimal("1450.75"))
                .status(AccountStatus.ACTIVE)
                .build();
        chequing.addHolder(customer);
        accountRepository.save(chequing);

        Account savings = Account.builder()
                .accountNumber("2008471920")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("10450.00"))
                .status(AccountStatus.ACTIVE)
                .build();
        savings.addHolder(customer);
        accountRepository.save(savings);

        // 4. Seed Transactions
        Transaction tx1 = Transaction.builder()
                .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .destinationAccount(chequing)
                .amount(new BigDecimal("2500.00"))
                .transactionType(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Initial Deposit")
                .build();
        transactionRepository.save(tx1);

        Transaction tx2 = Transaction.builder()
                .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .sourceAccount(chequing)
                .destinationAccount(savings)
                .amount(new BigDecimal("1000.00"))
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description("Savings transfer allocation")
                .build();
        transactionRepository.save(tx2);

        // 5. Seed Beneficiaries
        Beneficiary b1 = Beneficiary.builder()
                .customer(customer)
                .name("Alexander Graham Bell")
                .accountNumber("1001112222")
                .nickname("Alex")
                .build();
        beneficiaryRepository.save(b1);

        Beneficiary b2 = Beneficiary.builder()
                .customer(customer)
                .name("Frederick Banting")
                .accountNumber("2003334444")
                .nickname("Fred")
                .build();
        beneficiaryRepository.save(b2);

        log.info("Demo database seeding operations completed successfully.");
    }
}
