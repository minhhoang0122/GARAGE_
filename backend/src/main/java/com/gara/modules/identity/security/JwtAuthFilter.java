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
            String uri = request.getRequestURI();
            String method = request.getMethod();
            
            // Skip logging for public endpoints and OPTIONS preflight requests
            if (!method.equals("OPTIONS") && 
                !uri.startsWith("/api/auth/") && 
                !uri.startsWith("/api/public/") && 
                !uri.startsWith("/api/status/") && 
                !uri.startsWith("/api/ws/") && 
                !uri.startsWith("/api/garage-ws/") && 
                !uri.startsWith("/api-docs") && 
                !uri.startsWith("/swagger-ui")) {
                System.out.println("[JWT-Filter] No Token found for [" + method + "] URI: " + uri);
            }
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtUtil.isTokenValid(token) && !jwtUtil.isTokenExpired(token)) {
                Integer userId = jwtUtil.extractUserId(token);

                if (userId != null) {
                    // Performance Fix: Cache user status to prevent DB hit on every request
                    Boolean isActive = getCachedUserStatus(userId);
                    
                    String requestUri = request.getRequestURI();
                    System.out.println("[JWT-Filter] Authenticating User ID: " + userId + " | URI: " + requestUri + " | Active: " + isActive);

                    if (isActive == null || !isActive) {
                        System.err.println("[JWT-Filter] AUTH REJECTED: User ID " + userId + " is inactive or not found in DB");
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Extract authorities from JWT
                    List<?> rawRoles = jwtUtil.extractRoles(token);
                    List<?> rawPermissions = jwtUtil.extractPermissions(token);

                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                    if (rawRoles != null) {
                        rawRoles.forEach(r -> {
                            if (r == null) return;
                            // Support both simple string and object with name/code
                            String roleName = (r instanceof String) ? (String) r : null;
                            if (roleName == null && r instanceof java.util.Map) {
                                java.util.Map<?, ?> map = (java.util.Map<?, ?>) r;
                                roleName = (String) (map.get("name") != null ? map.get("name") : map.get("code"));
                            }
                            
                            if (roleName != null && !roleName.trim().isEmpty()) {
                                String cleanRole = roleName.trim().toUpperCase();
                                if (cleanRole.startsWith("ROLE_")) cleanRole = cleanRole.substring(5);
                                
                                authorities.add(new SimpleGrantedAuthority(cleanRole));
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanRole));
                            }
                        });
                    }

                    if (rawPermissions != null) {
                        rawPermissions.forEach(p -> {
                            if (p instanceof String) {
                                authorities.add(new SimpleGrantedAuthority(((String) p).toUpperCase()));
                            }
                        });
                    }

                    System.out.println("[JWT-Filter] FINAL AUTHORITIES for User " + userId + ": " + authorities);

                    // Create Authentication Token
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            System.err.println("[JWT-Filter] AUTH ERROR: " + e.getMessage());
            SecurityContextHolder.clearContext();
            
            // Return 401 JSON immediately
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            String json = "{\"success\": false, \"status\": 401, \"message\": \"Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.\"}";
            response.getWriter().write(json);
            return; // Terminate filter chain
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
