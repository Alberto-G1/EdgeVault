package com.edgevault.edgevaultbackend.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

public final class ValidationUtil {

    private ValidationUtil() {}

    private static final Pattern NAME_PATTERN = Pattern.compile("^[A-Za-z][A-Za-z' -]{1,49}$");
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^(?=.{4,30}$)(?![0-9]+$)[A-Za-z0-9_]+$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(?:\\+256|256|0)(7[0-8][0-9]{7})$");
    private static final Pattern COMPLEX_PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$");

    // Domain-specific patterns for EdgeVault
    private static final Pattern DOCUMENT_TITLE_PATTERN = Pattern.compile("^[A-Za-z0-9 ._()-]{2,150}$");
    private static final Pattern DEPARTMENT_NAME_PATTERN = Pattern.compile("^[A-Za-z ]{2,80}$");
    private static final Pattern ROLE_NAME_PATTERN = Pattern.compile("^[A-Za-z_ ]{2,50}$");
    private static final Pattern DESCRIPTION_PATTERN = Pattern.compile("^[A-Za-z0-9 ,.()'\"/-]{5,500}$");
    private static final Pattern JOB_TITLE_PATTERN = Pattern.compile("^[A-Za-z /-]{2,100}$");
    private static final Pattern EMPLOYEE_ID_PATTERN = Pattern.compile("^[A-Za-z0-9-]{3,20}$");
    private static final Pattern LOCATION_PATTERN = Pattern.compile("^[A-Za-z .-]{2,100}$");
    private static final Pattern SUPERVISOR_NAME_PATTERN = Pattern.compile("^[A-Za-z][A-Za-z' -]{1,79}$");
    private static final Pattern CHAT_MESSAGE_PATTERN = Pattern.compile("^[\\s\\S]{1,5000}$"); // Allow all chars, 1-5000 length
    private static final Pattern NOTIFICATION_MESSAGE_PATTERN = Pattern.compile("^[\\s\\S]{1,1000}$");
    private static final Pattern SEARCH_QUERY_PATTERN = Pattern.compile("^[A-Za-z0-9 ._-]{1,100}$");

    private static final Set<String> COMMON_PASSWORDS = new HashSet<>(Arrays.asList(
            "password","123456","123456789","qwerty","111111","123123","abc123","Password1!","letmein","admin","welcome"
    ));

    public static String sanitize(String input) {
        if (input == null) return null;
        String trimmed = input.trim();
        String collapsed = trimmed.replaceAll("\\s+", " ");
        String noAngles = collapsed.replace("<", "").replace(">", "");
        String lowered = noAngles.toLowerCase(Locale.ROOT);
        if (lowered.contains("script:") || lowered.contains("javascript:") || lowered.contains("onerror=")) {
            throw badRequest("Invalid content detected.");
        }
        return noAngles;
    }

    // --- User Field Validators ---
    public static String validateFirstName(String firstName) {
        String value = sanitize(firstName);
        if (isBlank(value)) throw badRequest("First name is required.");
        if (!NAME_PATTERN.matcher(value).matches())
            throw badRequest("First name must be 2–50 characters and may include letters, spaces, hyphens, or apostrophes only.");
        return value;
    }

    public static String validateLastName(String lastName) {
        String value = sanitize(lastName);
        if (isBlank(value)) throw badRequest("Last name is required.");
        if (!NAME_PATTERN.matcher(value).matches())
            throw badRequest("Last name must be 2–50 characters and may include letters, spaces, hyphens, or apostrophes only.");
        return value;
    }

    public static String validateUsername(String username) {
        String value = sanitize(username);
        if (isBlank(value)) throw badRequest("Username is required.");
        if (!USERNAME_PATTERN.matcher(value).matches())
            throw badRequest("Username must be 4–30 characters, contain letters/numbers/underscores only, and cannot be only digits.");
        return value;
    }

    public static String validateEmail(String email) {
        String value = sanitize(email);
        if (isBlank(value)) throw badRequest("Email is required.");
        if (!EMAIL_PATTERN.matcher(value).matches()) throw badRequest("Please provide a valid email address.");
        return value;
    }

    public static String validateOptionalEmail(String email) {
        String value = sanitize(email);
        if (isBlank(value)) return null;
        if (!EMAIL_PATTERN.matcher(value).matches()) throw badRequest("Please provide a valid email address.");
        return value;
    }

    public static String validateOptionalPhone(String phone) {
        String value = sanitize(phone);
        if (isBlank(value)) return null;
        value = value.replace(" ", "").replace("-", "").replace("(", "").replace(")", "");
        if (!PHONE_PATTERN.matcher(value).matches()) throw badRequest("Please provide a valid Ugandan phone number (e.g., +256701234567).");
        return value;
    }

    public static String validatePassword(String password, String firstName, String lastName, String username) {
        if (isBlank(password)) throw badRequest("Password is required.");
        if (!COMPLEX_PASSWORD_PATTERN.matcher(password).matches())
            throw badRequest("Password must be 8–30 characters and include uppercase, lowercase, digit, and special character (@$!%*?&).");
        if (!password.equals(password.trim())) throw badRequest("Password cannot start or end with spaces.");
        if (COMMON_PASSWORDS.contains(password.toLowerCase(Locale.ROOT)))
            throw badRequest("Password is too common. Choose a stronger password.");
        if (password.chars().distinct().count() <= 2)
            throw badRequest("Password is too repetitive. Use a more complex combination.");
        
        String pLower = password.toLowerCase(Locale.ROOT);
        if (!isBlank(firstName) && pLower.contains(firstName.toLowerCase(Locale.ROOT)))
            throw badRequest("Password must not contain your first name.");
        if (!isBlank(lastName) && pLower.contains(lastName.toLowerCase(Locale.ROOT)))
            throw badRequest("Password must not contain your last name.");
        if (!isBlank(username) && pLower.contains(username.toLowerCase(Locale.ROOT)))
            throw badRequest("Password must not contain your username.");
        
        return password;
    }

    public static void validateConfirmPassword(String password, String confirmPassword) {
        if (isBlank(confirmPassword)) throw badRequest("Please confirm your password.");
        if (!password.equals(confirmPassword))
            throw badRequest("Passwords do not match.");
    }

    // --- Domain-Specific Validators for EdgeVault ---

    public static String validateDocumentTitle(String title) {
        String value = sanitize(title);
        if (isBlank(value)) throw badRequest("Document title is required.");
        if (!DOCUMENT_TITLE_PATTERN.matcher(value).matches())
            throw badRequest("Document title must be 2–150 characters and may include letters, numbers, spaces, periods, underscores, hyphens, and parentheses.");
        return value;
    }

    public static String validateDepartmentName(String name) {
        String value = sanitize(name);
        if (isBlank(value)) throw badRequest("Department name is required.");
        if (!DEPARTMENT_NAME_PATTERN.matcher(value).matches())
            throw badRequest("Department name must be 2–80 characters using letters and spaces only.");
        return value;
    }

    public static String validateRoleName(String name) {
        String value = sanitize(name);
        if (isBlank(value)) throw badRequest("Role name is required.");
        if (!ROLE_NAME_PATTERN.matcher(value).matches())
            throw badRequest("Role name must be 2–50 characters using letters, spaces, and underscores only.");
        return value;
    }

    public static String validateDescriptionOptional(String description) {
        String value = sanitize(description);
        if (isBlank(value)) return null;
        if (!DESCRIPTION_PATTERN.matcher(value).matches())
            throw badRequest("Description must be 5–500 characters with standard punctuation.");
        return value;
    }

    public static String validateJobTitle(String jobTitle) {
        String value = sanitize(jobTitle);
        if (isBlank(value)) return null;
        if (!JOB_TITLE_PATTERN.matcher(value).matches())
            throw badRequest("Job title must be 2–100 characters using letters, spaces, hyphens, and slashes.");
        return value;
    }

    public static String validateEmployeeId(String employeeId) {
        String value = sanitize(employeeId);
        if (isBlank(value)) return null;
        if (!EMPLOYEE_ID_PATTERN.matcher(value).matches())
            throw badRequest("Employee ID must be 3–20 characters using letters, numbers, and hyphens only.");
        return value;
    }

    public static LocalDate validateOptionalDateOfBirth(LocalDate dob) {
        if (dob == null) return null;
        LocalDate today = LocalDate.now();
        if (!dob.isBefore(today)) throw badRequest("Date of birth must be in the past.");
        LocalDate eighteenYearsAgo = today.minusYears(18);
        if (dob.isAfter(eighteenYearsAgo)) throw badRequest("You must be at least 18 years old.");
        return dob;
    }

    public static LocalDate validateDateJoined(LocalDate dateJoined) {
        if (dateJoined == null) return LocalDate.now();
        LocalDate today = LocalDate.now();
        if (dateJoined.isAfter(today)) throw badRequest("Date joined cannot be in the future.");
        return dateJoined;
    }

    public static String validateOptionalLocation(String location) {
        String value = sanitize(location);
        if (isBlank(value)) return null;
        if (!LOCATION_PATTERN.matcher(value).matches())
            throw badRequest("Location must be 2–100 characters using letters, spaces, periods, and hyphens.");
        return value;
    }

    public static String validateSupervisorName(String supervisorName) {
        String value = sanitize(supervisorName);
        if (isBlank(value)) return null;
        if (!SUPERVISOR_NAME_PATTERN.matcher(value).matches())
            throw badRequest("Supervisor name must be 2–80 characters using letters, spaces, hyphens, or apostrophes.");
        return value;
    }

    public static String validateChatMessageContent(String content) {
        if (isBlank(content)) throw badRequest("Message content cannot be empty.");
        String value = content.trim(); // Don't sanitize content too aggressively for chat
        if (!CHAT_MESSAGE_PATTERN.matcher(value).matches())
            throw badRequest("Message content must be between 1 and 5000 characters.");
        // Basic XSS check
        String lower = value.toLowerCase(Locale.ROOT);
        if (lower.contains("<script") || lower.contains("javascript:") || lower.contains("onerror=")) {
            throw badRequest("Invalid content detected in message.");
        }
        return value;
    }

    public static String validateNotificationMessage(String message) {
        if (isBlank(message)) throw badRequest("Notification message cannot be empty.");
        String value = message.trim();
        if (!NOTIFICATION_MESSAGE_PATTERN.matcher(value).matches())
            throw badRequest("Notification message must be between 1 and 1000 characters.");
        return value;
    }

    public static String validateAlternativePhoneNumber(String phone) {
        return validateOptionalPhone(phone);
    }

    public static String validateCity(String city) {
        return validateOptionalLocation(city);
    }

    public static String validateDistrict(String district) {
        return validateOptionalLocation(district);
    }

    public static String validateCountry(String country) {
        return validateOptionalLocation(country);
    }

    public static String validateSearchQuery(String query) {
        String value = sanitize(query);
        if (isBlank(value)) throw badRequest("Search query cannot be empty.");
        if (!SEARCH_QUERY_PATTERN.matcher(value).matches())
            throw badRequest("Search query must be 1–100 characters and may include letters, numbers, spaces, periods, underscores, and hyphens.");
        return value;
    }

    public static String validateProfilePictureUrl(String url) {
        String value = sanitize(url);
        if (isBlank(value)) return null;
        if (value.length() > 500) throw badRequest("Profile picture URL is too long (max 500 characters).");
        // Basic URL validation - check if it looks like a URL or relative path
        if (!value.matches("^(https?://|/|data:image/).*")) 
            throw badRequest("Profile picture URL must be a valid URL or relative path.");
        return value;
    }

    public static String validatePermissionName(String permissionName) {
        String value = sanitize(permissionName);
        if (isBlank(value)) throw badRequest("Permission name is required.");
        if (!ROLE_NAME_PATTERN.matcher(value).matches())
            throw badRequest("Permission name must be 2–50 characters using letters, spaces, and underscores only.");
        return value;
    }

    // --- Utility Methods ---

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}

