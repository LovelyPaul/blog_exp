import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { authErrorCodes, type AuthErrorCode } from './error';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
} from './schema';

export const signupUser = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, AuthErrorCode, unknown>> => {
  // 1. 이메일 중복 확인
  const { data: existingUser } = await client
    .from('users')
    .select('id')
    .eq('email', request.email)
    .maybeSingle();

  if (existingUser) {
    return failure(
      400,
      authErrorCodes.emailAlreadyExists,
      '이미 가입된 이메일입니다.',
    );
  }

  // 2. Supabase Auth 계정 생성
  const { data: authData, error: authError } = await client.auth.signUp({
    email: request.email,
    password: request.password,
  });

  if (authError || !authData.user) {
    return failure(
      500,
      authErrorCodes.supabaseAuthError,
      authError?.message || 'Auth 계정 생성 실패',
    );
  }

  // 3. users 테이블에 레코드 생성
  const { data: userData, error: userError } = await client
    .from('users')
    .insert({
      id: authData.user.id,
      email: request.email,
      role: request.role,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (userError || !userData) {
    return failure(
      500,
      authErrorCodes.userCreationFailed,
      '사용자 정보 생성 실패',
    );
  }

  // 4. user_agreements 테이블에 약관 동의 내역 저장
  const agreements = [
    {
      user_id: userData.id,
      agreement_type: 'terms',
      agreement_version: '1.0',
      is_agreed: true,
    },
    {
      user_id: userData.id,
      agreement_type: 'privacy',
      agreement_version: '1.0',
      is_agreed: true,
    },
  ];

  if (request.agreements.marketing) {
    agreements.push({
      user_id: userData.id,
      agreement_type: 'marketing',
      agreement_version: '1.0',
      is_agreed: true,
    });
  }

  const { error: agreementError } = await client
    .from('user_agreements')
    .insert(agreements);

  if (agreementError) {
    return failure(
      500,
      authErrorCodes.agreementSaveFailed,
      '약관 동의 내역 저장 실패',
    );
  }

  // 5. 성공 응답
  return success({
    userId: userData.id,
    email: userData.email,
    role: userData.role as 'influencer' | 'advertiser',
    needsOnboarding: true,
  });
};

export const loginUser = async (
  client: SupabaseClient,
  request: LoginRequest,
): Promise<HandlerResult<LoginResponse, AuthErrorCode, unknown>> => {
  // 1. Supabase Auth 로그인
  const { data: authData, error: authError } =
    await client.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

  if (authError || !authData.user) {
    return failure(
      401,
      authErrorCodes.invalidCredentials,
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  // 2. users 테이블에서 사용자 정보 조회
  const { data: userData, error: userError } = await client
    .from('users')
    .select('id, email, role, onboarding_completed')
    .eq('id', authData.user.id)
    .single();

  if (userError || !userData) {
    return failure(500, authErrorCodes.userNotFound, '사용자 정보를 찾을 수 없습니다.');
  }

  return success({
    userId: userData.id,
    email: userData.email,
    role: userData.role as 'influencer' | 'advertiser',
    onboardingCompleted: userData.onboarding_completed,
  });
};

export const getCurrentUser = async (
  client: SupabaseClient,
): Promise<HandlerResult<CurrentUserResponse, AuthErrorCode, unknown>> => {
  // 1. 현재 세션 확인
  const {
    data: { user },
    error: sessionError,
  } = await client.auth.getUser();

  if (sessionError || !user) {
    return failure(401, authErrorCodes.sessionError, '인증되지 않은 사용자입니다.');
  }

  // 2. users 테이블에서 사용자 정보 조회
  const { data: userData, error: userError } = await client
    .from('users')
    .select('id, email, role, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return failure(500, authErrorCodes.userNotFound, '사용자 정보를 찾을 수 없습니다.');
  }

  return success({
    userId: userData.id,
    email: userData.email,
    role: userData.role as 'influencer' | 'advertiser',
    onboardingCompleted: userData.onboarding_completed,
  });
};

export const logoutUser = async (
  client: SupabaseClient,
): Promise<HandlerResult<{ success: boolean }, AuthErrorCode, unknown>> => {
  const { error } = await client.auth.signOut();

  if (error) {
    return failure(500, authErrorCodes.sessionError, '로그아웃 실패');
  }

  return success({ success: true });
};