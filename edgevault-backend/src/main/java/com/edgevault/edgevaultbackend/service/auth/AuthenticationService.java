package com.edgevault.edgevaultbackend.service.auth;

import com.edgevault.edgevaultbackend.dto.auth.AuthenticationResponse;
import com.edgevault.edgevaultbackend.dto.auth.LoginRequest;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.security.JwtService;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthenticationResponse login(LoginRequest request) {
        // 1. Authenticate the user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Fetch the full user object
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));

        // 3. Generate the token
        String jwtToken = jwtService.generateToken(user);

        // 4. Gather all permissions
        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getName())
                .collect(Collectors.toSet());

        // 5. Build the final response object
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token(jwtToken)
                .permissions(permissions)
                .build();

        // 6. Fire and forget the audit event
        auditService.recordEvent(
                user.getUsername(),
                "USER_LOGIN_SUCCESS",
                "User '" + user.getUsername() + "' successfully logged in."
        );

        // 7. Return the response
        return response;
    }
}