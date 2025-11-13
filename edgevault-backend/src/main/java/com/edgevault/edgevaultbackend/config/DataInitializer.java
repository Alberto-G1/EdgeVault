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

        // --- UPDATED PERMISSION NAMES ---
        List<String> permissionNames = Arrays.asList(
                "USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
                "ROLE_READ", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
                "DEPARTMENT_READ", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "DOCUMENT_SHARE"
        );
        // -----------------------------

        Set<Permission> allPermissions = permissionNames.stream()
                .map(this::createPermissionIfNotFound)
                .collect(Collectors.toSet());

        Role superAdminRole = createRoleIfNotFound("SUPER_ADMIN");
        superAdminRole.setPermissions(allPermissions);
        roleRepository.save(superAdminRole);

        Role userRole = createRoleIfNotFound("USER");
        // --- UPDATED USER PERMISSIONS ---
        Set<Permission> userPermissions = Set.of(
                createPermissionIfNotFound("DOCUMENT_READ"),
                createPermissionIfNotFound("DOCUMENT_CREATE")
        );
        // ------------------------------
        userRole.setPermissions(userPermissions);
        roleRepository.save(userRole);

        Optional<User> adminUserOptional = userRepository.findByUsername("Administrator");
        if (adminUserOptional.isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("Administrator");
            adminUser.setEmail("admin@edgevault.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setRoles(Set.of(superAdminRole));
            adminUser.setEnabled(true);
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