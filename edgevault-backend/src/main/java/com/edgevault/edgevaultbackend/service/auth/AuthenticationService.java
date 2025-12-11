package com.edgevault.edgevaultbackend.service.auth;

import com.edgevault.edgevaultbackend.dto.auth.AuthenticationResponse;
import com.edgevault.edgevaultbackend.dto.auth.LoginRequest;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.repository.user.UserRepository;
import com.edgevault.edgevaultbackend.security.JwtService;
import com.edgevault.edgevaultbackend.service.audit.AuditService;
import com.edgevault.edgevaultbackend.service.security.RememberMeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;
    private final RememberMeService rememberMeService;

    public AuthenticationResponse login(LoginRequest request, HttpServletResponse response, String ipAddress, String userAgent) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));

        String jwtToken = jwtService.generateToken(user);

        // Handle remember me functionality
        if (request.isRememberMe()) {
            String rememberMeToken = rememberMeService.generateRememberMeToken(user, ipAddress, userAgent);
            
            // Create HTTP-only secure cookie
            Cookie rememberMeCookie = new Cookie("REMEMBER_ME", rememberMeToken);
            rememberMeCookie.setHttpOnly(true);
            rememberMeCookie.setSecure(true); // Enable in production with HTTPS
            rememberMeCookie.setPath("/");
            rememberMeCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days in seconds
            rememberMeCookie.setAttribute("SameSite", "Strict");
            
            response.addCookie(rememberMeCookie);
            
            log.info("Remember me cookie set for user: {}", user.getUsername());
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getName())
                .collect(Collectors.toSet());

        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .token(jwtToken)
                .permissions(permissions)
                .passwordChangeRequired(user.isPasswordChangeRequired())
                .build();

        auditService.recordEvent(
                user.getUsername(),
                "USER_LOGIN_SUCCESS",
                "User '" + user.getUsername() + "' successfully logged in." + (request.isRememberMe() ? " (Remember Me enabled)" : "")
        );

        return authResponse;
    }

    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        // Extract remember me token from cookie
        String rememberMeToken = extractRememberMeToken(request);
        
        if (rememberMeToken != null) {
            // Invalidate the remember me token
            rememberMeService.invalidateToken(rememberMeToken);
            
            // Clear the cookie
            clearRememberMeCookie(response);
            
            log.info("Remember me token invalidated and cookie cleared");
        }
        
        return Map.of("message", "Logged out successfully");
    }

    private String extractRememberMeToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("REMEMBER_ME".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void clearRememberMeCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("REMEMBER_ME", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete cookie
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }
}