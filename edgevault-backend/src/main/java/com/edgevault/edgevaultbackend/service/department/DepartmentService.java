package com.edgevault.edgevaultbackend.service.department;

import com.edgevault.edgevaultbackend.dto.department.DepartmentDto;
import com.edgevault.edgevaultbackend.dto.department.DepartmentRequestDto;
import com.edgevault.edgevaultbackend.exception.DuplicateResourceException;
import com.edgevault.edgevaultbackend.exception.ResourceNotFoundException;
import com.edgevault.edgevaultbackend.model.department.Department;
import com.edgevault.edgevaultbackend.repository.department.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDepartmentDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto createDepartment(DepartmentRequestDto request) {
        departmentRepository.findByName(request.getName()).ifPresent(d -> {
            throw new DuplicateResourceException("Department with name '" + request.getName() + "' already exists.");
        });
        Department department = new Department(request.getName());
        department.setDescription(request.getDescription()); // <-- SET DESCRIPTION
        Department saved = departmentRepository.save(department);
        return mapToDepartmentDto(saved);
    }

    public DepartmentDto updateDepartment(Long id, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!department.getName().equals(request.getName())) {
            departmentRepository.findByName(request.getName()).ifPresent(d -> {
                throw new DuplicateResourceException("Department with name '" + request.getName() + "' already exists.");
            });
            department.setName(request.getName());
        }

        department.setDescription(request.getDescription()); // <-- UPDATE DESCRIPTION

        Department updated = departmentRepository.save(department);
        return mapToDepartmentDto(updated);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        departmentRepository.delete(department);
    }

    private DepartmentDto mapToDepartmentDto(Department department) {
        return DepartmentDto.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription()) // <-- MAP DESCRIPTION
                .build();
    }
}