export const authErrorCodes = {
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  invalidCredentials: 'INVALID_CREDENTIALS',
  passwordTooWeak: 'PASSWORD_TOO_WEAK',
  rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
  supabaseAuthError: 'SUPABASE_AUTH_ERROR',
  userCreationFailed: 'USER_CREATION_FAILED',
  agreementSaveFailed: 'AGREEMENT_SAVE_FAILED',
  userNotFound: 'USER_NOT_FOUND',
  sessionError: 'SESSION_ERROR',
} as const;

export type AuthErrorCode =
  (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = {
  code: AuthErrorCode;
  message: string;
};