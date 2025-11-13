package com.edgevault.edgevaultbackend.service.role;

import com.edgevault.edgevaultbackend.dto.role.RoleDto;
import com.edgevault.edgevaultbackend.dto.role.RoleRequestDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.model.role.Role;
import com.edgevault.edgevaultbackend.repository.permission.PermissionRepository;
import com.edgevault.edgevaultbackend.repository.role.RoleRepository;
import lombok.RequiredArgsConstructor;
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
        roleRepository.findByName(request.getName()).ifPresent(r -> {
            throw new DuplicateResourceException("Role with name '" + request.getName() + "' already exists.");
        });

        Role role = new Role(request.getName());
        if (request.getPermissions() != null) {
            Set<Permission> permissions = findPermissionsByName(request.getPermissions());
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return mapToRoleDto(savedRole);
    }

    @Transactional
    public RoleDto updateRole(Long roleId, RoleRequestDto request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        // Check for name duplication if name is being changed
        if (!role.getName().equals(request.getName())) {
            roleRepository.findByName(request.getName()).ifPresent(r -> {
                throw new DuplicateResourceException("Role with name '" + request.getName() + "' already exists.");
            });
            role.setName(request.getName());
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissions() != null) {
            permissions = findPermissionsByName(request.getPermissions());
        }
        role.setPermissions(permissions);

        Role updatedRole = roleRepository.save(role);
        return mapToRoleDto(updatedRole);
    }

    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        if (role.getName().equals("SUPER_ADMIN") || role.getName().equals("USER")) {
            throw new IllegalStateException("Cannot delete core system roles.");
        }
        // Add logic here to reassign users of this role if needed, or prevent deletion if in use.
        // For now, we allow deletion.
        roleRepository.delete(role);
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
}