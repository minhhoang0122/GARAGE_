package com.gara.config;

import com.gara.modules.identity.security.JwtAuthFilter;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/ws/**").permitAll() // WebSocket: permitAll to handle internal handshake correctly
                        .requestMatchers("/api/users/presence/stream").permitAll() // SSE: permitAll to avoid 'response committed' crash

                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        
                        // User Profile & Avatar - Allowed for any authenticated user (self-service)
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/online-details").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*/avatar").authenticated()

                        // Admin only endpoints - Users management
                        .requestMatchers("/api/users", "/api/users/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/reports", "/api/reports/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/config", "/api/config/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/logs", "/api/logs/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // Vehicle History (Hồ sơ Xe - Admin + Sale)
                        .requestMatchers("/api/admin/vehicles/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE")

                        // Suppliers (Nhà cung cấp - Admin + Kho + Sale)
                        .requestMatchers("/api/suppliers/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "KHO", "ROLE_KHO", "SALE", "ROLE_SALE")

                        // Warehouse (§5: Kho)
                        .requestMatchers("/api/warehouse/**")
                        .hasAnyAuthority("MANAGE_INVENTORY", "EXPORT_ORDER_WAREHOUSE", "CREATE_PROPOSAL", "ADMIN", "KHO", "ROLE_KHO")

                        // Inventory Check (§5.4: Kiểm soát lệch kho)
                        .requestMatchers("/api/inventory-check/**").hasAnyAuthority("MANAGE_INVENTORY", "ADMIN", "KHO", "ROLE_KHO")

                        // Sale (§3: Sale + liên quan)
                        .requestMatchers("/api/sale/**")
                        .hasAnyAuthority("VIEW_ORDER_LIST", "CREATE_RECEPTION", "CREATE_PROPOSAL", "ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE")

                        // Reception (§2+§3: Tiếp nhận xe)
                        .requestMatchers("/api/reception/**")
                        .hasAnyAuthority("CREATE_RECEPTION", "ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE", "QUAN_LY_XUONG", "THO_SUA_CHUA")

                        // Mechanic (§4: Thợ chẩn đoán + Thợ sửa chữa)
                        .requestMatchers("/api/mechanic/**")
                        .hasAnyAuthority("CLAIM_REPAIR_JOB", "CREATE_PROPOSAL", "APPROVE_QC", "ADMIN", "ROLE_ADMIN", "QUAN_LY_XUONG", "ROLE_QUAN_LY_XUONG", "THO_SUA_CHUA", "ROLE_THO_SUA_CHUA", "VIEW_ALL_JOBS", "ASSIGN_WORK")

                        .requestMatchers("/api/payment/**", "/api/transactions/order/**")
                        .hasAnyAuthority("ISSUE_INVOICE", "FINANCIAL_REPORT", "ADMIN", "SALE", "ROLE_SALE", "VIEW_ORDER_LIST")
                        .requestMatchers("/api/transactions/**")
                        .hasAnyAuthority("ISSUE_INVOICE", "FINANCIAL_REPORT", "ADMIN", "SALE", "ROLE_SALE")

                        // Debts (§6.2: Công nợ - Admin + Thu ngân)
                        .requestMatchers("/api/debts/**").hasAnyAuthority("FINANCIAL_REPORT", "ADMIN")

                        // Customer portal
                        .requestMatchers("/api/customer/**").hasAnyAuthority("ADMIN", "KHACH_HANG", "ROLE_KHACH")

                        // Product Management (Shared)
                        .requestMatchers("/api/products/**")
                        .hasAnyAuthority("VIEW_ORDER_LIST", "MANAGE_INVENTORY", "CREATE_PROPOSAL", "ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE", "KHO", "ROLE_KHO", "QUAN_LY_XUONG", "ROLE_QUAN_LY_XUONG", "THO_SUA_CHUA", "ROLE_THO_SUA_CHUA")

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

        // Bug 8 Fix: Do not allow '*' in production. Use restricted whitelist from
        // application.yml
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        } else {
            configuration.setAllowedOriginPatterns(List.of("http://localhost:[*]", "https://*.vercel.app")); // Safe default patterns
        }

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
