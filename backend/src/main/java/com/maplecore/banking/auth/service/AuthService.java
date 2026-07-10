package com.maplecore.banking.auth.service;

import com.maplecore.banking.auth.dto.*;
import com.maplecore.banking.auth.entity.RefreshToken;
import com.maplecore.banking.common.exception.DuplicateRequestException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.common.exception.UnauthorizedAccessException;
import com.maplecore.banking.user.entity.Role;
import com.maplecore.banking.user.entity.User;
import com.maplecore.banking.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateRequestException("Email address is already in use.");
        }

        Set<Role> assignedRoles = new HashSet<>();
        if (request.roles() == null || request.roles().isEmpty()) {
            assignedRoles.add(Role.CUSTOMER);
        } else {
            assignedRoles.addAll(request.roles());
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(assignedRoles)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Generate tokens for immediate login after registration
        String accessToken = jwtService.generateToken(savedUser);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        Set<String> rolesSet = savedUser.getRoles().stream()
                .map(Role::name)
                .collect(Collectors.toSet());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                savedUser.getId(),
                savedUser.getEmail(),
                rolesSet
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) authentication.getPrincipal();
        if (!user.isActive()) {
            throw new UnauthorizedAccessException("Account is deactivated.");
        }

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        Set<String> rolesSet = user.getRoles().stream()
                .map(Role::name)
                .collect(Collectors.toSet());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getId(),
                user.getEmail(),
                rolesSet
        );
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.refreshToken());
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String accessToken = jwtService.generateToken(user);

        // Rotate Refresh Token
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenRefreshResponse(accessToken, newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        refreshTokenService.revokeByUser(user);
    }
}
