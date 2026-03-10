package com.gara.modules.identity.security;

import com.gara.entity.User;
import com.gara.modules.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Local cache for User entity to avoid DB hits on EVERY request (5 mins)
    private final Cache<Integer, User> userCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenValid(token) && !jwtUtil.isTokenExpired(token)) {
                Integer userId = jwtUtil.extractUserId(token);

                // Optimization: Fetch full User from cache/DB
                User user = userCache.get(userId, id -> {
                    return userRepository.findById(id).orElse(null);
                });

                if (user != null && user.getTrangThaiHoatDong()) {
                    // Extract authorities from JWT as they are already there
                    java.util.List<String> roles = jwtUtil.extractRoles(token);
                    java.util.List<String> permissions = jwtUtil.extractPermissions(token);

                    java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

                    if (roles != null) {
                        roles.forEach(roleName -> {
                            authorities.add(new SimpleGrantedAuthority(roleName));
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                        });
                    }

                    if (permissions != null) {
                        permissions.forEach(permissionCode -> {
                            authorities.add(new SimpleGrantedAuthority(permissionCode));
                        });
                    }

                    // CRITICAL FIX: Set full User object as principal so @AuthenticationPrincipal
                    // works correctly
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("Authentication failed via JWT", e);
        }

        filterChain.doFilter(request, response);
    }
}
