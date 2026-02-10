package com.edgevault.edgevaultbackend.service.role;

import com.edgevault.edgevaultbackend.dto.role.RoleDto;
import com.edgevault.edgevaultbackend.dto.role.RoleRequestDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.repository.permission.PermissionRepository;
import com.edgevault.edgevaultbackend.repository.role.RoleRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditService auditService;

    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
    }

    public RoleDto getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return mapToRoleDto(role);
    }

    @Transactional
    public RoleDto createRole(RoleRequestDto request) {
        String roleName = ValidationUtil.validateRoleName(request.getName());
        
        roleRepository.findByName(roleName).ifPresent(r -> {
            throw new DuplicateResourceException("Role with name '" + roleName + "' already exists.");
        });

        Role role = new Role(roleName);
        if (request.getPermissions() != null) {
            Set<Permission> permissions = findPermissionsByName(request.getPermissions());
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Created new role '%s' (ID: %d) with permissions [%s].",
                savedRole.getName(),
                savedRole.getId(),
                request.getPermissions() != null ? String.join(", ", request.getPermissions()) : "none");
        auditService.recordEvent(getCurrentUsername(), "ROLE_CREATE", auditDetails);
        // -----------------

        return mapToRoleDto(savedRole);
    }

    @Transactional
    public RoleDto updateRole(Long roleId, RoleRequestDto request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        String roleName = ValidationUtil.validateRoleName(request.getName());
        
        if (!role.getName().equals(roleName)) {
            roleRepository.findByName(roleName).ifPresent(r -> {
                throw new DuplicateResourceException("Role with name '" + roleName + "' already exists.");
            });
            role.setName(roleName);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissions() != null) {
            permissions = findPermissionsByName(request.getPermissions());
        }
        role.setPermissions(permissions);

        Role updatedRole = roleRepository.save(role);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Updated role '%s' (ID: %d). Set permissions to [%s].",
                updatedRole.getName(),
                updatedRole.getId(),
                request.getPermissions() != null ? String.join(", ", request.getPermissions()) : "none");
        auditService.recordEvent(getCurrentUsername(), "ROLE_UPDATE", auditDetails);
        // -----------------

        return mapToRoleDto(updatedRole);
    }

    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        if (role.getName().equals("Super Admin") || role.getName().equals("Department User")) { // Add other core roles here
            throw new IllegalStateException("Cannot delete core system roles.");
        }

        roleRepository.delete(role);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Deleted role '%s' (ID: %d).", role.getName(), roleId);
        auditService.recordEvent(getCurrentUsername(), "ROLE_DELETE", auditDetails);
        // -----------------
    }


    private Set<Permission> findPermissionsByName(Set<String> permissionNames) {
        return permissionNames.stream()
                .map(name -> permissionRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + name)))
                .collect(Collectors.toSet());
    }

    private RoleDto mapToRoleDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}