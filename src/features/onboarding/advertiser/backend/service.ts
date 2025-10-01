import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  advertiserErrorCodes,
  type AdvertiserErrorCode,
} from './error';
import type {
  AdvertiserProfileRequest,
  AdvertiserProfileResponse,
} from './schema';

export const createAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
  request: AdvertiserProfileRequest,
): Promise<
  HandlerResult<AdvertiserProfileResponse, AdvertiserErrorCode, unknown>
> => {
  // 1. 사업자번호 중복 체크 (하이픈 제거 후 비교)
  const cleanedBusinessNumber = request.business_number.replace(/-/g, '');

  const { data: existingProfiles } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('business_number', cleanedBusinessNumber);

  if (existingProfiles && existingProfiles.length > 0) {
    return failure(
      400,
      advertiserErrorCodes.duplicateBusinessNumber,
      '이미 등록된 사업자등록번호입니다.',
    );
  }

  // 2. 프로필 생성
  const { data, error } = await client
    .from('advertiser_profiles')
    .insert({
      user_id: userId,
      name: request.name,
      phone: request.phone,
      business_name: request.business_name,
      business_number: cleanedBusinessNumber,
      representative_name: request.representative_name || null,
      business_category: request.category,
      address: request.address,
      address_detail: request.address_detail || null,
      latitude: request.latitude || null,
      longitude: request.longitude || null,
    })
    .select()
    .single();

  if (error || !data) {
    return failure(
      500,
      advertiserErrorCodes.profileCreationFailed,
      '프로필 생성 실패',
    );
  }

  // 3. users 테이블 onboarding_completed 업데이트
  const { error: updateError } = await client
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  if (updateError) {
    return failure(
      500,
      advertiserErrorCodes.userUpdateFailed,
      'onboarding 상태 업데이트 실패',
    );
  }

  return success({
    profileId: data.id,
    userId: data.user_id,
    businessName: data.business_name,
  });
};
