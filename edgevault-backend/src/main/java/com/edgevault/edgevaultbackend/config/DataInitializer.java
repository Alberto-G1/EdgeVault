package com.edgevault.edgevaultbackend.config;

import com.edgevault.edgevaultbackend.model.Role;
import com.edgevault.edgevaultbackend.model.User;
import com.edgevault.edgevaultbackend.repository.RoleRepository;
import com.edgevault.edgevaultbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Starting data initialization...");

        // Create SUPER_ADMIN role if it doesn't exist
        Role superAdminRole = createRoleIfNotFound("SUPER_ADMIN");
        // Create standard USER role if it doesn't exist
        createRoleIfNotFound("USER");

        // Create Super Admin User if it doesn't exist
        Optional<User> adminUserOptional = userRepository.findByUsername("Administrator");
        if (adminUserOptional.isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("Administrator");
            adminUser.setEmail("admin@edgevault.com");
            // IMPORTANT: Use a strong, unique password in a real environment
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setRoles(Set.of(superAdminRole));
            adminUser.setEnabled(true);
            userRepository.save(adminUser);
            System.out.println("Created SUPER_ADMIN user: sAdministrator");
        } else {
            System.out.println("SUPER_ADMIN user already exists.");
        }

        System.out.println("Data initialization finished.");
    }

    private Role createRoleIfNotFound(String roleName) {
        Optional<Role> roleOptional = roleRepository.findByName(roleName);
        if (roleOptional.isEmpty()) {
            Role newRole = new Role(roleName);
            roleRepository.save(newRole);
            System.out.println("Created role: " + roleName);
            return newRole;
        }
        return roleOptional.get();
    }
}