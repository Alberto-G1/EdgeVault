package com.edgevault.edgevaultbackend.security;

import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.service.security.RememberMeService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RememberMeAuthenticationFilter extends OncePerRequestFilter {

    private final RememberMeService rememberMeService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Only process remember me if there's no existing authentication
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String rememberMeToken = extractRememberMeToken(request);
            
            if (rememberMeToken != null) {
                try {
                    String ipAddress = getClientIpAddress(request);
                    String userAgent = request.getHeader("User-Agent");
                    
                    // Validate and rotate token
                    User user = rememberMeService.validateAndRotateToken(rememberMeToken, ipAddress, userAgent);
                    
                    // Set authentication in security context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Set new rotated token in cookie
                    String newToken = rememberMeService.getCurrentToken(user).orElse(null);
                    if (newToken != null) {
                        Cookie newRememberMeCookie = new Cookie("REMEMBER_ME", newToken);
                        newRememberMeCookie.setHttpOnly(true);
                        newRememberMeCookie.setSecure(true);
                        newRememberMeCookie.setPath("/");
                        newRememberMeCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
                        newRememberMeCookie.setAttribute("SameSite", "Strict");
                        response.addCookie(newRememberMeCookie);
                    }
                    
                    log.debug("User authenticated via remember me: {}", user.getUsername());
                    
                } catch (Exception e) {
                    // Invalid or expired token - clear cookie
                    log.debug("Remember me authentication failed: {}", e.getMessage());
                    clearRememberMeCookie(response);
                }
            }
        }
        
        filterChain.doFilter(request, response);
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

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
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
