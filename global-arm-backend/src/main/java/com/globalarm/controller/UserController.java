
package com.globalarm.controller;

import com.globalarm.model.User;
import com.globalarm.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Return user details without exposing password hashes.
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Create a new user account.
    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(
            HttpStatus.CREATED)
    public UserResponse createUser(
            @RequestBody CreateUserRequest request) {

        if (request == null
                || request.username() == null
                || request.username().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required.");
        }

        String username = request.username().trim();

        if (username.length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username cannot exceed 50 characters.");
        }

        if (request.password() == null
                || request.password().length() < 8
                || request.password().length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must contain 8 to 72 characters.");
        }

        if (request.role() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role is required.");
        }

        String role = request.role()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!role.equals("ADMIN") && !role.equals("OFFICER")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be ADMIN or OFFICER.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(
                passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    // Activate or deactivate an existing account safely.
    @PatchMapping("/{id}/status")
    public UserResponse updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status request is required.");
        }

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found."));

        // Prevent deactivating your own account.
        if (!request.active()
                && user.getUsername().equals(
                        authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot deactivate your own account.");
        }

        // Prevent deactivating the last active administrator.
        if (!request.active()
                && "ADMIN".equalsIgnoreCase(user.getRole())
                && user.isActive()) {

            long activeAdmins = userRepository.findAll()
                    .stream()
                    .filter(u -> u.isActive())
                    .filter(u -> "ADMIN".equalsIgnoreCase(
                            u.getRole()))
                    .count();

            if (activeAdmins <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "You cannot deactivate the last active administrator.");
            }
        }

        user.setActive(request.active());

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    // Convert the entity to a safe response.
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isActive()
        );
    }

    public record CreateUserRequest(
            String username,
            String password,
            String role) {
    }

    public record UpdateStatusRequest(boolean active) {
    }

    public record UserResponse(
            Long id,
            String username,
            String role,
            boolean active) {
    }
}
