package com.company.kyc.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.company.kyc.dto.LoginRequest;
import com.company.kyc.dto.RegisterRequest;
import com.company.kyc.model.Role;
import com.company.kyc.model.User;
import com.company.kyc.repository.RoleRepository;
import com.company.kyc.repository.UserRepository;
import com.company.kyc.util.jwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final jwtUtil wtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       jwtUtil wtUtil,
                       PasswordEncoder passwordEncoder) {   

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.wtUtil = wtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(RegisterRequest request) {

        Role role = roleRepository
                .findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();

        user.setName(request.name);
        //user.setUsername(request.username);
        user.setMobileNo(request.mobileno);
        //user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setRole(role);

        userRepository.save(user);

        return wtUtil.generateJwtToken(user.getUsername());
    }

    public String login(LoginRequest request) {

        User user = userRepository
                .findByMobileno(request.mobileno)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return wtUtil.generateJwtToken(user.getMobileNo());
    }

}