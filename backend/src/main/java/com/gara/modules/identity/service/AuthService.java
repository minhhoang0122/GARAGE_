package com.gara.modules.identity.service;

import com.gara.dto.LoginRequest;
import com.gara.dto.LoginResponse;
import com.gara.entity.User;
import com.gara.entity.Role;
import com.gara.entity.Permission;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.identity.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final com.gara.modules.support.service.LoginAttemptService loginAttemptService;
    private final com.gara.modules.auth.repository.PermissionRepository permissionRepository;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            com.gara.modules.support.service.LoginAttemptService loginAttemptService,
            com.gara.modules.auth.repository.PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginAttemptService = loginAttemptService;
        this.permissionRepository = permissionRepository;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.username();
        if (loginAttemptService.isBlocked(username)) {
            throw new RuntimeException("Tài khoản đã bị tạm khóa (15 phút) do đăng nhập sai quá nhiều lần");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    loginAttemptService.loginFailed(username);
                    return new RuntimeException("Tên đăng nhập không tồn tại");
                });

        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            loginAttemptService.loginFailed(username);
            throw new RuntimeException("Mật khẩu không đúng");
        }

        loginAttemptService.loginSucceeded(username);

        List<String> roles = user.getRoles() != null 
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                : java.util.Collections.emptyList();

        List<String> permissions = user.getRoles() != null
                ? user.getRoles().stream()
                    .flatMap(role -> role.getPermissions() != null ? role.getPermissions().stream() : java.util.stream.Stream.empty())
                    .map(Permission::getCode)
                    .distinct()
                    .collect(Collectors.toList())
                : java.util.Collections.emptyList();

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roles, permissions);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    public User getCurrentUser(String token) {
        if (token == null || !jwtUtil.isTokenValid(token)) {
            return null;
        }
        Integer userId = jwtUtil.extractUserId(token);
        return userRepository.findById(userId).orElse(null);
    }

    // INTERNAL USE ONLY - Not exposed to API
    public void seedDefaultUsers(com.gara.modules.auth.repository.RoleRepository roleRepository) {
        seedUser(roleRepository, "admin", "Quản Trị Viên", "ADMIN");
        seedUser(roleRepository, "sale1", "Nhân Viên Sale", "SALE");
        seedUser(roleRepository, "quandoc1", "Quản Đốc Xưởng", "QUAN_LY_XUONG");
        seedMechanic(roleRepository, "tho2", "Nguyễn Văn Bình", "THO_SUA_CHUA",
                com.gara.entity.enums.MechanicSpecialty.MAY,
                com.gara.entity.enums.MechanicLevel.KY_THUAT_VIEN);
        seedMechanic(roleRepository, "tho3", "Trần Văn Cường", "THO_SUA_CHUA",
                com.gara.entity.enums.MechanicSpecialty.DIEN,
                com.gara.entity.enums.MechanicLevel.KTV_CHINH);
        seedUser(roleRepository, "kho1", "Thủ Kho", "KHO");
        seedUser(roleRepository, "khach1", "Nguyễn Văn Khách", "KHACH_HANG");

        // Seed permissions for roles
        seedRolePermissions(roleRepository);
    }

    private void seedRolePermissions(com.gara.modules.auth.repository.RoleRepository roleRepository) {
        // QUAN_LY_XUONG permissions
        assignPermissionsToRole(roleRepository, "QUAN_LY_XUONG", new String[][]{
            {"CREATE_PROPOSAL", "Lập đề xuất sửa chữa", "SERVICE"},
            {"APPROVE_QC", "Duyệt nghiệm thu QC", "SERVICE"},
            {"REJECT_QC", "Từ chối nghiệm thu QC", "SERVICE"},
            {"ASSIGN_WORK", "Chia việc cho thợ", "SERVICE"},
            {"VIEW_ALL_JOBS", "Xem tất cả việc trong xưởng", "SERVICE"},
            {"COMPLETE_REPAIR_JOB", "Đánh dấu hoàn thành hạng mục", "SERVICE"},
            {"VIEW_ASSIGNED_JOBS", "Xem danh sách việc được giao", "SERVICE"},
        });

        // THO_SUA_CHUA permissions (limited)
        assignPermissionsToRole(roleRepository, "THO_SUA_CHUA", new String[][]{
            {"COMPLETE_REPAIR_JOB", "Đánh dấu hoàn thành hạng mục", "SERVICE"},
            {"VIEW_ASSIGNED_JOBS", "Xem danh sách việc được giao", "SERVICE"},
            {"REQUEST_MATERIAL", "Yêu cầu thêm vật tư", "SERVICE"},
        });

        // KHACH_HANG permissions (customer portal)
        assignPermissionsToRole(roleRepository, "KHACH_HANG", new String[][]{
            {"VIEW_OWN_VEHICLES", "Xem danh sách xe của mình", "CUSTOMER"},
            {"VIEW_OWN_ORDERS", "Xem đơn sửa chữa của mình", "CUSTOMER"},
            {"CREATE_BOOKING", "Đặt lịch hẹn sửa chữa", "CUSTOMER"},
        });

        // SALE permissions
        assignPermissionsToRole(roleRepository, "SALE", new String[][]{
            {"VIEW_ORDER_LIST", "Xem danh sách đơn hàng", "SALE"},
            {"CREATE_RECEPTION", "Tiếp nhận xe mới", "SALE"},
            {"CREATE_PROPOSAL", "Lập báo giá", "SALE"},
            {"VIEW_ALL_CUSTOMERS", "Xem danh sách khách hàng", "SALE"},
            {"UPDATE_ORDER_DETAIL", "Sửa đổi chi tiết đơn hàng", "SALE"},
            {"PROCESS_PAYMENT", "Thực hiện thanh toán/đặt cọc", "SALE"},
            {"VIEW_FINANCE_STATS", "Xem thống kê tài chính cơ bản", "FINANCE"},
        });
    }

    private void assignPermissionsToRole(com.gara.modules.auth.repository.RoleRepository roleRepository,
            String roleName, String[][] permissionDefs) {
        Role role = roleRepository.findByName(roleName).orElse(null);
        if (role == null) return;
        for (String[] pDef : permissionDefs) {
            String code = pDef[0];
            String name = pDef[1];
            String module = pDef[2];

            Permission perm = findOrCreatePermission(code, name, module);
            if (!role.getPermissions().contains(perm)) {
                role.getPermissions().add(perm);
            }
        }
        roleRepository.save(role);
    }

    private Permission findOrCreatePermission(String code, String name, String module) {
        return permissionRepository.findByCode(code)
                .orElseGet(() -> {
                    Permission p = new Permission();
                    p.setCode(code);
                    p.setName(name);
                    p.setModule(module);
                    return permissionRepository.save(p);
                });
    }

    private void seedUser(com.gara.modules.auth.repository.RoleRepository roleRepository,
            String username, String fullName, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });

        var userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setFullName(fullName);
            user.setRoles(new java.util.HashSet<>(java.util.Set.of(role)));
            user.setPasswordHash(passwordEncoder.encode("123456"));
            user.setIsActive(true);
            user.setPhone("0900000000");
            try {
                userRepository.save(user);
            } catch (Exception e) {
                log.warn("Could not save user {}: {}. It might already exist with a different username.", username, e.getMessage());
            }
        } else {
            User user = userOptional.get();
            if (!passwordEncoder.matches("123456", user.getPasswordHash())) {
                log.info("Syncing/Resetting password for seeded user: {}", username);
                user.setPasswordHash(passwordEncoder.encode("123456"));
                userRepository.save(user);
            }
            
            // Ensure seeded users are ALWAYS active
            if (!user.getIsActive()) {
                log.info("Activating locked seeded user: {}", username);
                user.setIsActive(true);
                userRepository.save(user);
            }
            
            if (user.getRoles().stream().noneMatch(r -> r.getName().equals(roleName))) {
                user.getRoles().add(role);
                userRepository.save(user);
            }
        }
    }

    private void seedMechanic(com.gara.modules.auth.repository.RoleRepository roleRepository,
            String username, String fullName, String roleName,
            com.gara.entity.enums.MechanicSpecialty specialty,
            com.gara.entity.enums.MechanicLevel level) {
        // Seed the user with role first
        seedUser(roleRepository, username, fullName, roleName);

        // Then set mechanic attributes
        var userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getSpecialty() == null) {
                user.setSpecialty(specialty);
            }
            if (user.getLevel() == null) {
                user.setLevel(level);
            }
            userRepository.save(user);
        }
    }
}

