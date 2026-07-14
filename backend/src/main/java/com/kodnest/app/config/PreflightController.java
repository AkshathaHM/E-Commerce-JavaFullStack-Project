package com.kodnest.app.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PreflightController {

    @RequestMapping(path = "/api/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handlePreflight(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        String acrh = request.getHeader("Access-Control-Request-Headers");

        HttpHeaders headers = new HttpHeaders();
        headers.add("Access-Control-Allow-Origin", origin != null ? origin : "*");
        headers.add("Vary", "Origin");
        headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        headers.add("Access-Control-Allow-Headers", acrh != null ? acrh : "Content-Type, Authorization");
        headers.add("Access-Control-Allow-Credentials", "true");
        headers.add("Access-Control-Max-Age", "3600");

        return new ResponseEntity<>(headers, HttpStatus.OK);
    }
}
