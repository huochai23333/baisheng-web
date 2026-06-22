export function getPasswordPolicyState(password: string) {
  // Keep this client-side check aligned with the Supabase Auth password policy.
  const hasMinLength = password.length >= 10;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return {
    hasLetter: hasLowercase || hasUppercase,
    hasLowercase,
    hasMinLength,
    hasNumber,
    hasUppercase,
    isValid: hasMinLength && hasLowercase && hasUppercase && hasNumber,
  };
}
