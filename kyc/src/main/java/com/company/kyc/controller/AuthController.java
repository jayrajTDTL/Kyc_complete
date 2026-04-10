package com.company.kyc.controller;

import org.springframework.web.bind.annotation.*;

import com.company.kyc.dto.*;
import com.company.kyc.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://192.168.0.132:3000/")
//@CrossOrigin(origins = "http://localhost:3000/")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {

        String token = authService.register(request);

        return new AuthResponse(token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        String token = authService.login(request);

        return new AuthResponse(authService.login(request));
    }

}