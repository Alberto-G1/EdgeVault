package com.edgevault.edgevaultbackend.service.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@edgevault.com}")
    private String fromEmail;

    @Value("${app.email.from-name:EdgeVault Document Management}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.token-validity-minutes:15}")
    private int tokenValidityMinutes;

    /**
     * Send password reset email asynchronously.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("EdgeVault - Password Reset Request");

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String htmlContent = buildPasswordResetEmailTemplate(username, resetLink, tokenValidityMinutes);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
        } catch (Exception e) {
            log.error("Unexpected error sending password reset email to: {}", toEmail, e);
        }
    }

    /**
     * Send password reset confirmation email asynchronously.
     */
    @Async
    public void sendPasswordResetConfirmationEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("EdgeVault - Password Reset Successful");

            String htmlContent = buildPasswordResetConfirmationTemplate(username);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset confirmation email sent successfully to: {}", toEmail);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send password reset confirmation email to: {}", toEmail, e);
        } catch (Exception e) {
            log.error("Unexpected error sending password reset confirmation email to: {}", toEmail, e);
        }
    }

    /**
     * Build HTML template for password reset email.
     */
    private String buildPasswordResetEmailTemplate(String username, String resetLink, int validityMinutes) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            padding: 40px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            color: rgb(46, 151, 197);
                            margin-bottom: 10px;
                        }
                        h1 {
                            color: #333;
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 14px 36px;
                            background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            margin: 20px 0;
                            transition: transform 0.2s;
                        }
                        .button:hover {
                            transform: translateY(-2px);
                        }
                        .info-box {
                            background: #f8f9fa;
                            border-left: 4px solid rgb(46, 151, 197);
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left-color: rgb(229, 151, 54);
                            color: #856404;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e0e0e0;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🔐 EdgeVault</div>
                            <h1>Password Reset Request</h1>
                        </div>
                        
                        <p>Hello <strong>%s</strong>,</p>
                        
                        <p>We received a request to reset your password for your EdgeVault account. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </div>
                        
                        <div class="info-box">
                            <strong>⏱️ Time Sensitive:</strong> This link will expire in <strong>%d minutes</strong>.
                        </div>
                        
                        <div class="info-box warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>If you didn't request this password reset, please ignore this email.</li>
                                <li>Never share this link with anyone.</li>
                                <li>EdgeVault will never ask for your password via email.</li>
                            </ul>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <span style="word-break: break-all; color: rgb(46, 151, 197);">%s</span>
                        </p>
                        
                        <div class="footer">
                            <p>&copy; 2024 EdgeVault Document Management System. All rights reserved.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, username, resetLink, validityMinutes, resetLink);
    }

    /**
     * Build HTML template for password reset confirmation email.
     */
    private String buildPasswordResetConfirmationTemplate(String username) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            padding: 40px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            color: rgb(46, 151, 197);
                            margin-bottom: 10px;
                        }
                        .success-icon {
                            font-size: 64px;
                            margin: 20px 0;
                        }
                        h1 {
                            color: #333;
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        .info-box {
                            background: #d4edda;
                            border-left: 4px solid #28a745;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                            color: #155724;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left-color: rgb(229, 151, 54);
                            color: #856404;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e0e0e0;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🔐 EdgeVault</div>
                            <div class="success-icon">✅</div>
                            <h1>Password Reset Successful</h1>
                        </div>
                        
                        <p>Hello <strong>%s</strong>,</p>
                        
                        <p>Your password has been successfully reset. You can now log in to your EdgeVault account using your new password.</p>
                        
                        <div class="info-box">
                            <strong>✓ Password Updated:</strong> Your password was changed successfully.
                        </div>
                        
                        <div class="info-box warning">
                            <strong>⚠️ Didn't make this change?</strong>
                            <p style="margin: 10px 0;">
                                If you didn't reset your password, please contact your system administrator immediately. 
                                Your account may have been compromised.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; 2024 EdgeVault Document Management System. All rights reserved.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, username);
    }
}
