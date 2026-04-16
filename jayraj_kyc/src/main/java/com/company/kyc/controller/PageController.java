/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.company.kyc.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.core.annotation.Order;


@Controller
@CrossOrigin("*")
@Order(Integer.MAX_VALUE)  // ← lowest priority, runs last
public class PageController {
    @GetMapping(value = "/{path:^(?!api|static)[^\\.]*}")
    public String redirectRoot() {
        return "forward:/index.html";
    }

    @GetMapping(value = "/{path:^(?!api|static)[^\\.]*}/**")
    public String redirectNested() {
        return "forward:/index.html";
    }
}
