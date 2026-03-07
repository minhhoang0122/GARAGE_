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

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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

        if (jwtUtil.isTokenValid(token) && !jwtUtil.isTokenExpired(token)) {
            Integer userId = jwtUtil.extractUserId(token);

            User user = userRepository.findById(userId).orElse(null);

            if (user != null && user.getTrangThaiHoatDong()) {
                java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

                // Fetch fresh roles and permissions from DB instead of relying on token claims
                if (user.getRoles() != null) {
                    user.getRoles().forEach(role -> {
                        authorities.add(new SimpleGrantedAuthority(role.getName())); // for hasAuthority
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName())); // for hasRole

                        if (role.getPermissions() != null) {
                            role.getPermissions().forEach(permission -> {
                                authorities.add(new SimpleGrantedAuthority(permission.getCode())); // for hasAuthority
                            });
                        }
                    });
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
