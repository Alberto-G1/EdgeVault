package com.edgevault.edgevaultbackend.service.auth;

import com.edgevault.edgevaultbackend.dto.auth.AuthenticationResponse;
import com.edgevault.edgevaultbackend.dto.auth.LoginRequest;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.security.JwtService;
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

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(); // Should not happen if auth is successful
        var jwtToken = jwtService.generateToken(user);

        // Gather all unique permissions from all of the user's roles
        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getName())
                .collect(Collectors.toSet());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .permissions(permissions) // Include the aggregated permissions in the response
                .build();
    }
}