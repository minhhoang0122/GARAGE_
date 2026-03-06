package com.gara.config;

import com.gara.modules.identity.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Admin only endpoints
                        .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/reports", "/api/reports/**").hasRole("ADMIN")
                        .requestMatchers("/api/config", "/api/config/**").hasRole("ADMIN")

                        // Warehouse (§5: Kho)
                        .requestMatchers("/api/warehouse/**").hasAnyRole("ADMIN", "KHO")

                        // Inventory Check (§5.4: Kiểm soát lệch kho)
                        .requestMatchers("/api/inventory-check/**").hasAnyRole("ADMIN", "KHO")

                        // Sale (§3: Sale + liên quan)
                        .requestMatchers("/api/sale/**")
                        .hasAnyRole("ADMIN", "SALE", "THO_CHAN_DOAN", "THO_SUA_CHUA", "KHO")

                        // Reception (§2+§3: Tiếp nhận xe)
                        .requestMatchers("/api/reception/**")
                        .hasAnyRole("ADMIN", "SALE", "THO_CHAN_DOAN")

                        // Mechanic (§4: Thợ chẩn đoán + Thợ sửa chữa)
                        .requestMatchers("/api/mechanic/**")
                        .hasAnyRole("ADMIN", "THO_CHAN_DOAN", "THO_SUA_CHUA")

                        // Payment & Transactions (§6.1: Thanh toán)
                        .requestMatchers("/api/payment/**")
                        .hasAnyRole("ADMIN", "SALE", "KE_TOAN")
                        .requestMatchers("/api/transactions/**")
                        .hasAnyRole("ADMIN", "SALE", "KE_TOAN")

                        // Debts (§6.2: Công nợ - Admin + Kế toán)
                        .requestMatchers("/api/debts/**").hasAnyRole("ADMIN", "KE_TOAN")

                        // Customer portal
                        .requestMatchers("/api/customer/**").hasAnyRole("ADMIN", "KHACH")

                        // Product Management (Shared)
                        .requestMatchers("/api/products/**")
                        .hasAnyRole("ADMIN", "SALE", "KHO", "THO_SUA_CHUA", "THO_CHAN_DOAN")

                        // Notifications (§9: Mọi role đều nhận thông báo)
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Test endpoints (dev only, require ADMIN)
                        .requestMatchers("/api/test/**").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
