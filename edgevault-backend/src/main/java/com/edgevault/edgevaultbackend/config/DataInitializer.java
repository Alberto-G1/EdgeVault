package com.edgevault.edgevaultbackend.config;

import com.edgevault.edgevaultbackend.model.chat.Conversation;
import com.edgevault.edgevaultbackend.model.chat.ConversationType;
import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.chat.ConversationRepository;
import com.edgevault.edgevaultbackend.repository.department.DepartmentRepository;
import com.edgevault.edgevaultbackend.repository.permission.PermissionRepository;
import com.edgevault.edgevaultbackend.repository.role.RoleRepository;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements ApplicationListener<ContextRefreshedEvent> {

    private boolean alreadySetup = false;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;
    private final DepartmentRepository departmentRepository;
    private final ConversationRepository conversationRepository;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, PermissionRepository permissionRepository, DepartmentRepository departmentRepository, ConversationRepository conversationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionRepository = permissionRepository;
        this.departmentRepository = departmentRepository;
        this.conversationRepository = conversationRepository;
    }

    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (alreadySetup) {
            return;
        }

        System.out.println("Starting data initialization on context refresh...");

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
                "WORK_PROFILE_EDIT",
                "DOCUMENT_APPROVAL"
        );
        // This loop ensures all permissions are saved to the DB within the transaction
        permissionNames.forEach(this::createPermissionIfNotFound);


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
        superAdminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
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
        }

        // --- SEED GLOBAL CHAT CONVERSATION ---
        conversationRepository.findByName("Global Chat").or(() -> {
            System.out.println("Creating Global Chat conversation.");
            Conversation globalChat = new Conversation();
            globalChat.setName("Global Chat");
            globalChat.setType(ConversationType.GROUP);
            globalChat.setCreatedAt(LocalDateTime.now());
            // In a real app, you might add all users to this group here
            conversationRepository.save(globalChat);
            return Optional.of(globalChat);
        });
        // ------------------------------------

        System.out.println("Data initialization finished.");

        alreadySetup = true; // Set flag to true
    }

    private Role createRoleIfNotFound(String roleName) {
        return roleRepository.findByName(roleName)
                .orElse(new Role(roleName));
    }

    private Permission createPermissionIfNotFound(String permissionName) {
        return permissionRepository.findByName(permissionName)
                .orElseGet(() -> permissionRepository.save(new Permission(permissionName)));
    }
}