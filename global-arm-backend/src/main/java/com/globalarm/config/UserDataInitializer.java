
package com.globalarm.config;

import com.globalarm.model.User;
import com.globalarm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataInitializer {

    @Bean
    public CommandLineRunner createInitialUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "ADMIN"
                );

                userRepository.save(admin);
                System.out.println("Initial admin account created.");
            }

            if (!userRepository.existsByUsername("officer")) {
                User officer = new User(
                    "officer",
                    passwordEncoder.encode("officer123"),
                    "OFFICER"
                );

                userRepository.save(officer);
                System.out.println("Initial officer account created.");
            }
        };
    }
}
