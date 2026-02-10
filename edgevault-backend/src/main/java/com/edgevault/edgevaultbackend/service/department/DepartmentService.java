package com.edgevault.edgevaultbackend.service.department;

import com.edgevault.edgevaultbackend.dto.department.DepartmentDto;
import com.edgevault.edgevaultbackend.dto.department.DepartmentRequestDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.repository.department.DepartmentRepository;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDepartmentDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto createDepartment(DepartmentRequestDto request) {
        String name = ValidationUtil.validateDepartmentName(request.getName());
        String description = ValidationUtil.validateDescriptionOptional(request.getDescription());
        
        departmentRepository.findByName(name).ifPresent(d -> {
            throw new DuplicateResourceException("Department with name '" + name + "' already exists.");
        });
        Department department = new Department(name);
        department.setDescription(description);
        Department saved = departmentRepository.save(department);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Created new department '%s' (ID: %d).", saved.getName(), saved.getId());
        auditService.recordEvent(getCurrentUsername(), "DEPARTMENT_CREATE", auditDetails);
        // -----------------

        return mapToDepartmentDto(saved);
    }

    public DepartmentDto updateDepartment(Long id, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        String name = ValidationUtil.validateDepartmentName(request.getName());
        String description = ValidationUtil.validateDescriptionOptional(request.getDescription());
        
        if (!department.getName().equals(name)) {
            departmentRepository.findByName(name).ifPresent(d -> {
                throw new DuplicateResourceException("Department with name '" + name + "' already exists.");
            });
            department.setName(name);
        }
        department.setDescription(description);
        Department updated = departmentRepository.save(department);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Updated department '%s' (ID: %d).", updated.getName(), updated.getId());
        auditService.recordEvent(getCurrentUsername(), "DEPARTMENT_UPDATE", auditDetails);
        // -----------------

        return mapToDepartmentDto(updated);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        departmentRepository.delete(department);

        // --- AUDIT LOG ---
        String auditDetails = String.format("Deleted department '%s' (ID: %d).", department.getName(), id);
        auditService.recordEvent(getCurrentUsername(), "DEPARTMENT_DELETE", auditDetails);
        // -----------------
    }

    private DepartmentDto mapToDepartmentDto(Department department) {
        return DepartmentDto.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription()) // <-- MAP DESCRIPTION
                .build();
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}