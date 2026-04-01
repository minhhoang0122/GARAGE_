package com.gara.modules.identity.security;

import com.gara.modules.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CacheManager cacheManager;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository, CacheManager cacheManager) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getParameter("token") != null) {
            // Hỗ trợ SSE (EventSource) gửi token qua URL
            token = request.getParameter("token");
        }

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtUtil.isTokenValid(token) && !jwtUtil.isTokenExpired(token)) {
                Integer userId = jwtUtil.extractUserId(token);

                if (userId != null) {
                    // Performance Fix: Cache user status to prevent DB hit on every request
                    Boolean isActive = getCachedUserStatus(userId);
                    if (isActive == null || !isActive) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Extract authorities from JWT
                    List<String> roles = jwtUtil.extractRoles(token);
                    List<String> permissions = jwtUtil.extractPermissions(token);

                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();

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

                    // Create Authentication Token with Integer principal (userId)
                    // This is the most stable approach across all modules
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            System.err.println("JWT authentication failed: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Lấy trạng thái active của user từ Cache, nếu không có mới truy vấn DB.
     * Cache name: auth_user_status (Cấu hình trong application.yml - TTL 300s)
     */
    private Boolean getCachedUserStatus(Integer userId) {
        Cache cache = cacheManager.getCache("auth_user_status");
        if (cache != null) {
            Boolean cachedValue = cache.get(userId, Boolean.class);
            if (cachedValue != null) return cachedValue;
        }

        // DB Fallback
        com.gara.entity.User user = userRepository.findById(userId).orElse(null);
        boolean isActive = (user != null && user.getIsActive());
        
        if (cache != null) {
            cache.put(userId, isActive);
        }
        return isActive;
    }
}
