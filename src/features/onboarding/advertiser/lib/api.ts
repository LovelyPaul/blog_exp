import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  AdvertiserProfileRequest,
  AdvertiserProfileResponse,
} from './dto';

export const postAdvertiserProfile = async (
  data: AdvertiserProfileRequest,
): Promise<AdvertiserProfileResponse> => {
  try {
    const response = await apiClient.post('/api/advertiser/profile', data);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error, '프로필 생성에 실패했습니다.');
    throw new Error(message);
  }
};
