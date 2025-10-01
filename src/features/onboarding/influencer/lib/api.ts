import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  InfluencerProfileRequest,
  InfluencerProfileResponse,
} from './dto';

export const postInfluencerProfile = async (
  data: InfluencerProfileRequest,
): Promise<InfluencerProfileResponse> => {
  try {
    const response = await apiClient.post('/api/influencer/profile', data);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error, '프로필 생성에 실패했습니다.');
    throw new Error(message);
  }
};
