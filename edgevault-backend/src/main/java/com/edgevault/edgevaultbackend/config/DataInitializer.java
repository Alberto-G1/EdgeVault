package com.edgevault.edgevaultbackend.config;

import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.permission.PermissionRepository;
import com.edgevault.edgevaultbackend.repository.role.RoleRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Starting data initialization...");

        // --- ALL SYSTEM PERMISSIONS ---
        List<String> permissionNames = Arrays.asList(
                // User Management
                "USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
                // Role Management
                "ROLE_READ", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
                // Department Management
                "DEPARTMENT_READ", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                // Document Management
                "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "DOCUMENT_SHARE",
                // Audit Permissions
                "AUDIT_READ", "AUDIT_EXPORT",

                "WORK_PROFILE_EDIT"
        );

        permissionNames.forEach(this::createPermissionIfNotFound);

        // --- ROLE DEFINITIONS ---

        // 1. Super Admin (all permissions)
        Role superAdminRole = createRoleIfNotFound("Super Admin");
        // Re-fetch all permissions to include the new one
        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());
        superAdminRole.setPermissions(allPermissions);
        roleRepository.save(superAdminRole);

        // 2. Department User
        Role deptUserRole = createRoleIfNotFound("Department User");
        deptUserRole.setPermissions(new HashSet<>(Set.of(
                createPermissionIfNotFound("DOCUMENT_READ"),
                createPermissionIfNotFound("DOCUMENT_CREATE")
        )));
        roleRepository.save(deptUserRole);

        // 3. Department Manager
        Role deptManagerRole = createRoleIfNotFound("Department Manager");
        deptManagerRole.setPermissions(new HashSet<>(Set.of(
                createPermissionIfNotFound("DOCUMENT_READ"),
                createPermissionIfNotFound("DOCUMENT_CREATE"),
                createPermissionIfNotFound("DOCUMENT_UPDATE"),
                createPermissionIfNotFound("DOCUMENT_DELETE"), // With workflow
                createPermissionIfNotFound("DOCUMENT_SHARE")  // With workflow
        )));
        roleRepository.save(deptManagerRole);

        // 4. Auditor
        Role auditorRole = createRoleIfNotFound("Auditor");
        auditorRole.setPermissions(new HashSet<>(Set.of(
                createPermissionIfNotFound("AUDIT_READ"),
                createPermissionIfNotFound("AUDIT_EXPORT"),
                createPermissionIfNotFound("DOCUMENT_READ") // Read-only access to documents
        )));
        roleRepository.save(auditorRole);

        // 5. External Partner (Guest)
        Role guestRole = createRoleIfNotFound("External Partner");
        guestRole.setPermissions(new HashSet<>()); // No permissions by default
        roleRepository.save(guestRole);


        // --- SEED SUPER ADMIN USER ---
        Optional<User> adminUserOptional = userRepository.findByUsername("Administrator");
        if (adminUserOptional.isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("Administrator");
            adminUser.setEmail("admin@edgevault.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setRoles(Set.of(superAdminRole));
            adminUser.setPasswordChangeRequired(false); // Admin does not need to change password
            userRepository.save(adminUser);
            System.out.println("Created SUPER_ADMIN user: Administrator");
        } else {
            System.out.println("SUPER_ADMIN user already exists.");
        }

        System.out.println("Data initialization finished.");
    }

    private Role createRoleIfNotFound(String roleName) {
        return roleRepository.findByName(roleName)
                .orElse(new Role(roleName));
    }

    private Permission createPermissionIfNotFound(String permissionName) {
        return permissionRepository.findByName(permissionName)
                .orElseGet(() -> {
                    System.out.println("Creating permission: " + permissionName);
                    return permissionRepository.save(new Permission(permissionName));
                });
    }
}