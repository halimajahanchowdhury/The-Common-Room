export interface PasswordCriteria {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

export function evaluatePassword(password: string): PasswordCriteria {
    return {
        length: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password),
    };
}

export function isPasswordValid(password: string): boolean {
    const criteria = evaluatePassword(password);
    return (
        criteria.length &&
        criteria.hasUppercase &&
        criteria.hasLowercase &&
        criteria.hasNumber &&
        criteria.hasSpecialChar
    );
}
