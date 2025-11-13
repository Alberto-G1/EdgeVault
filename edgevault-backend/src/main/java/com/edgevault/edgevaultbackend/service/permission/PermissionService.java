package com.edgevault.edgevaultbackend.service.permission;

import com.edgevault.edgevaultbackend.model.permission.Permission;
import com.edgevault.edgevaultbackend.repository.permission.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public List<String> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(Permission::getName)
                .collect(Collectors.toList());
    }
}