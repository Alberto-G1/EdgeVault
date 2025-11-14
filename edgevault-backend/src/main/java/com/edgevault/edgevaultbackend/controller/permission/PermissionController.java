package com.edgevault.edgevaultbackend.controller.permission;

import com.edgevault.edgevaultbackend.service.permission.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')") // Reading permissions is part of reading roles
    public ResponseEntity<List<String>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }
}