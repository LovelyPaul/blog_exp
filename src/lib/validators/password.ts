export const validatePassword = (
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push('영문자를 포함해야 합니다.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.');
  }

  return { valid: errors.length === 0, errors };
};