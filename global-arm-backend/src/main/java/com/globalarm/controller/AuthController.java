
package com.globalarm.controller;

import com.globalarm.model.User;
import com.globalarm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            throw new IllegalArgumentException(
                "Username and password are required"
            );
        }

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException(
                "Invalid username or password"
            ));

        if (!user.isActive()
                || !passwordEncoder.matches(
                    password, user.getPassword())) {
            throw new IllegalArgumentException(
                "Invalid username or password"
            );
        }

        return Map.of(
            "message", "Login successful",
            "username", user.getUsername(),
            "role", user.getRole()
        );
    }
}
