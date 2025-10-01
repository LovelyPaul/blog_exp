import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  influencerErrorCodes,
  type InfluencerErrorCode,
} from './error';
import type {
  InfluencerProfileRequest,
  InfluencerProfileResponse,
} from './schema';

export const createInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  request: InfluencerProfileRequest,
): Promise<
  HandlerResult<InfluencerProfileResponse, InfluencerErrorCode, unknown>
> => {
  // 1. URL 중복 체크
  const urls = request.sns_channels.map((ch) => ch.url);

  for (const url of urls) {
    const { data: existingProfiles } = await client
      .from('influencer_profiles')
      .select('id')
      .contains('sns_channels', [{ url }]);

    if (existingProfiles && existingProfiles.length > 0) {
      return failure(
        400,
        influencerErrorCodes.duplicateSnsUrl,
        '이미 등록된 SNS URL입니다.',
      );
    }
  }

  // 2. 프로필 생성
  const { data, error } = await client
    .from('influencer_profiles')
    .insert({
      user_id: userId,
      name: request.name,
      phone: request.phone,
      birth_date: request.birth_date,
      sns_channels: request.sns_channels,
      categories: request.categories || [],
    })
    .select()
    .single();

  if (error || !data) {
    return failure(
      500,
      influencerErrorCodes.profileCreationFailed,
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
      influencerErrorCodes.userUpdateFailed,
      'onboarding 상태 업데이트 실패',
    );
  }

  return success({
    profileId: data.id,
    userId: data.user_id,
    name: data.name,
  });
};

export const updateInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  request: InfluencerProfileRequest,
): Promise<
  HandlerResult<InfluencerProfileResponse, InfluencerErrorCode, unknown>
> => {
  // 1. 기존 프로필 확인
  const { data: existingProfile } = await client
    .from('influencer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!existingProfile) {
    return failure(
      404,
      influencerErrorCodes.profileNotFound,
      '프로필을 찾을 수 없습니다.',
    );
  }

  // 2. 프로필 업데이트
  const { data, error } = await client
    .from('influencer_profiles')
    .update({
      name: request.name,
      phone: request.phone,
      birth_date: request.birth_date,
      sns_channels: request.sns_channels,
      categories: request.categories || [],
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    return failure(
      500,
      influencerErrorCodes.profileUpdateFailed,
      '프로필 업데이트 실패',
    );
  }

  return success({
    profileId: data.id,
    userId: data.user_id,
    name: data.name,
  });
};