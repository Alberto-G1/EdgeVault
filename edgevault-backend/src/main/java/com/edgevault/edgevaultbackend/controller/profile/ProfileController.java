package com.edgevault.edgevaultbackend.controller.profile;

import com.edgevault.edgevaultbackend.dto.profile.ChangePasswordRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UpdateProfileRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UpdateWorkProfileRequestDto;
import com.edgevault.edgevaultbackend.dto.profile.UserProfileDto;
import com.edgevault.edgevaultbackend.service.profile.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile() {
        return ResponseEntity.ok(profileService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileRequestDto request) {
        return ResponseEntity.ok(profileService.updateCurrentUserProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changeCurrentUserPassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        profileService.changeCurrentUserPassword(request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/work-info")
    @PreAuthorize("hasAuthority('WORK_PROFILE_EDIT')")
    public ResponseEntity<UserProfileDto> updateCurrentUserWorkProfile(@Valid @RequestBody UpdateWorkProfileRequestDto request) {
        return ResponseEntity.ok(profileService.updateCurrentUserWorkProfile(request));
    }
}