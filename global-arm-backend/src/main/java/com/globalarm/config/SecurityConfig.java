
package com.globalarm.config;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // Allow browser CORS preflight requests.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Authentication endpoints must be reachable before login.
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()

                // Both ADMIN and OFFICER can submit reports.
                .requestMatchers(HttpMethod.POST, "/api/reports")
                    .hasAnyRole("ADMIN", "OFFICER")

                // Only ADMIN can view reports and update report status.
                .requestMatchers(HttpMethod.GET, "/api/reports")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/reports/**")
                    .hasRole("ADMIN")
// Trade risk: ADMIN runs analysis.
.requestMatchers(HttpMethod.POST, "/api/trade-risk/analyze")
    .hasRole("ADMIN")

// ADMIN and OFFICER can view findings.
.requestMatchers(HttpMethod.GET, "/api/trade-risk")
    .hasAnyRole("ADMIN", "OFFICER")

// Only ADMIN can review findings.
.requestMatchers(HttpMethod.PATCH, "/api/trade-risk/**")
    .hasRole("ADMIN")
                // All other endpoints still require authentication.
                .anyRequest().authenticated()
            )

            .sessionManagement(session ->
                session.sessionFixation(
                    fixation -> fixation.changeSessionId()
                )
            )

            .securityContext(context ->
                context.securityContextRepository(
                    securityContextRepository()
                )
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "PATCH",
                    "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
