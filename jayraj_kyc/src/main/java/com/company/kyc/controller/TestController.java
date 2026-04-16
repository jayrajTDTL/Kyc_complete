package com.company.kyc.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.core.io.ClassPathResource;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/testing")
public class TestController {

    @GetMapping("/api/test")
    public String test() {

        return "JWT Token is valid. Secure API accessed.";
    }

    @GetMapping("/debug-static")
    public String debug() {
        // Check if file exists in classpath
        var resource1 = new ClassPathResource("static/static/js/main.51946d9a.js");
        var resource2 = new ClassPathResource("static/js/main.51946d9a.js");
        
        return "Path1 (static/static/js/) exists: " + resource1.exists() 
             + "\nPath2 (static/js/) exists: " + resource2.exists();
    }
}