package com.edgevault.edgevaultbackend.config;

import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.department.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, PermissionRepository permissionRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionRepository = permissionRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Starting data initialization...");

        // --- STEP 1: CREATE ALL PERMISSIONS FIRST ---
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
        // This loop ensures all permissions are saved to the DB within the transaction
        permissionNames.forEach(this::createPermissionIfNotFound);
        // ---------------------------------------------


        // --- STEP 2: CREATE DEPARTMENT ---
        Department adminDepartment = departmentRepository.findByName("Administration")
                .orElseGet(() -> {
                    System.out.println("Creating 'Administration' department.");
                    Department newDept = new Department("Administration");
                    newDept.setDescription("Default department for system administrators.");
                    return departmentRepository.save(newDept);
                });


        // --- STEP 3: CREATE ROLES AND ASSIGN PERMISSIONS ---

        // 1. Super Admin (all permissions)
        Role superAdminRole = createRoleIfNotFound("Super Admin");
        // NOW this will find all permissions because they were created in Step 1
        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());
        superAdminRole.setPermissions(allPermissions);
        roleRepository.save(superAdminRole);

        // 2. Department User
        Role deptUserRole = createRoleIfNotFound("Department User");
        deptUserRole.setPermissions(new HashSet<>(Set.of(
                permissionRepository.findByName("DOCUMENT_READ").get(),
                permissionRepository.findByName("DOCUMENT_CREATE").get()
        )));
        roleRepository.save(deptUserRole);

        // 3. Department Manager
        Role deptManagerRole = createRoleIfNotFound("Department Manager");
        deptManagerRole.setPermissions(new HashSet<>(Set.of(
                permissionRepository.findByName("DOCUMENT_READ").get(),
                permissionRepository.findByName("DOCUMENT_CREATE").get(),
                permissionRepository.findByName("DOCUMENT_UPDATE").get(),
                permissionRepository.findByName("DOCUMENT_DELETE").get(),
                permissionRepository.findByName("DOCUMENT_SHARE").get()
        )));
        roleRepository.save(deptManagerRole);

        // 4. Auditor
        Role auditorRole = createRoleIfNotFound("Auditor");
        auditorRole.setPermissions(new HashSet<>(Set.of(
                permissionRepository.findByName("AUDIT_READ").get(),
                permissionRepository.findByName("AUDIT_EXPORT").get(),
                permissionRepository.findByName("DOCUMENT_READ").get()
        )));
        roleRepository.save(auditorRole);

        // 5. External Partner (Guest)
        Role guestRole = createRoleIfNotFound("External Partner");
        guestRole.setPermissions(new HashSet<>());
        roleRepository.save(guestRole);


        // --- STEP 4: SEED SUPER ADMIN USER ---
        Optional<User> adminUserOptional = userRepository.findByUsername("Administrator");
        if (adminUserOptional.isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("Administrator");
            adminUser.setEmail("admin@edgevault.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setRoles(new HashSet<>(Set.of(superAdminRole)));
            adminUser.setPasswordChangeRequired(false);
            adminUser.setDepartment(adminDepartment);
            userRepository.save(adminUser);
            System.out.println("Created SUPER_ADMIN user: Administrator");
        } else {
            User existingAdmin = adminUserOptional.get();
            if (existingAdmin.getDepartment() == null) {
                existingAdmin.setDepartment(adminDepartment);
                userRepository.save(existingAdmin);
                System.out.println("Assigned 'Administration' department to existing admin.");
            }
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