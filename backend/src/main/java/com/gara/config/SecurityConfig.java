package com.gara.config;

import com.gara.modules.identity.security.JwtAuthFilter;
import com.gara.modules.identity.security.RestAuthenticationEntryPoint;
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

    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(RestAuthenticationEntryPoint authenticationEntryPoint) {
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Always allow preflight
                        // 1. PUBLIC & AUTH (No filter or permitAll)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/status/**").permitAll()
                        .requestMatchers("/api/payment/sepay-webhook").permitAll()
                        .requestMatchers("/api/ws/**", "/api/garage-ws/**").permitAll()
                        .requestMatchers("/api/users/presence/stream").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        
                        // 2. STAFF SELF-SERVICE & PRESENCE (Authenticated - Any Role)
                        .requestMatchers(HttpMethod.GET, "/api/users/staff").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/online-status").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/online-details").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated() // Profile cá nhân
                        .requestMatchers(HttpMethod.GET, "/api/users/{id}").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/{id}/avatar").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()

                        // 3. ADMIN RESTRICTED AREAS (Strict)
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/reports/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/config/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/logs/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        
                        // Users management (CREATE/UPDATE/TOGGLE) - Admin only
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAnyAuthority("ADMIN", "ROLE_ADMIN") // List all users

                        // Vehicle History (Hồ sơ Xe - Admin + Sale)
                        .requestMatchers("/api/admin/vehicles/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE")

                        // Suppliers (Nhà cung cấp - Admin + Kho)
                        .requestMatchers("/api/suppliers/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "KHO", "ROLE_KHO")

                        // Warehouse (§5: Kho)
                        .requestMatchers("/api/warehouse/**")
                        .hasAnyAuthority("MANAGE_INVENTORY", "EXPORT_ORDER_WAREHOUSE", "CREATE_PROPOSAL", "ADMIN", "KHO", "ROLE_KHO")

                        // Inventory Check (§5.4: Kiểm soát lệch kho)
                        .requestMatchers("/api/inventory-check/**").hasAnyAuthority("MANAGE_INVENTORY", "ADMIN", "KHO", "ROLE_KHO")

                        // 4. SALE & RECEPTION
                        .requestMatchers("/api/sale/**").hasAnyAuthority("SALE", "ROLE_SALE", "ADMIN", "ROLE_ADMIN", "VIEW_ORDER_LIST")
                        .requestMatchers("/api/reception/**").hasAnyAuthority("SALE", "ROLE_SALE", "ADMIN", "ROLE_ADMIN", "QUAN_LY_XUONG", "ROLE_QUAN_LY_XUONG", "THO_SUA_CHUA", "ROLE_THO_SUA_CHUA")
                        .requestMatchers("/api/payment/**", "/api/transactions/order/**").hasAnyAuthority("SALE", "ROLE_SALE", "ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/transactions/**").hasAnyAuthority("SALE", "ROLE_SALE", "ADMIN", "ROLE_ADMIN")

                        // Customer portal
                        .requestMatchers("/api/customer/orders/**").hasAnyAuthority("ADMIN", "KHACH_HANG", "ROLE_KHACH", "SALE", "ROLE_SALE")
                        .requestMatchers("/api/customer/**").hasAnyAuthority("ADMIN", "KHACH_HANG", "ROLE_KHACH")
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        .requestMatchers("/api/products", "/api/products/**")
                        .hasAnyAuthority("VIEW_ORDER_LIST", "MANAGE_INVENTORY", "CREATE_PROPOSAL", "ADMIN", "ROLE_ADMIN", "SALE", "ROLE_SALE", "KHO", "ROLE_KHO", "QUAN_LY_XUONG", "ROLE_QUAN_LY_XUONG", "THO_SUA_CHUA", "ROLE_THO_SUA_CHUA")

                        // Notifications (§9: Mọi role đều nhận thông báo)
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Test endpoints (dev only, require ADMIN)
                        .requestMatchers("/api/test/**").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint))
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
            configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:[*]", 
                "https://*.vercel.app",
                "https://*.id.vn",
                "https://*.letanlex.id.vn"
            )); // Safe default patterns
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
