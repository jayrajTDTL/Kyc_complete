package com.company.kyc.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/testing")
public class TestController {

    @GetMapping("/api/test")
    public String test() {

        return "JWT Token is valid. Secure API accessed.";
    }
}