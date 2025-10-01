import { apiClient } from '@/lib/remote/api-client';
import type {
  CampaignListQuery,
  CampaignListResponse,
  CampaignDetail,
  CampaignCreateRequest,
  CampaignCreateResponse,
  CampaignUpdateRequest,
  AdvertiserCampaignQuery,
  AdvertiserCampaignListResponse,
} from './dto';

export const getCampaigns = async (
  query: Partial<CampaignListQuery>,
): Promise<CampaignListResponse> => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await apiClient.get(`/api/campaigns?${searchParams.toString()}`);
  return data;
};

export const getCampaignById = async (
  campaignId: string,
): Promise<CampaignDetail> => {
  const { data } = await apiClient.get(`/api/campaigns/${campaignId}`);
  return data;
};

export const createCampaign = async (
  request: CampaignCreateRequest,
): Promise<CampaignCreateResponse> => {
  const { data } = await apiClient.post('/api/campaigns', request);
  return data;
};

export const getAdvertiserCampaigns = async (
  query: Partial<AdvertiserCampaignQuery>,
): Promise<AdvertiserCampaignListResponse> => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await apiClient.get(`/api/my/campaigns?${searchParams.toString()}`);
  return data;
};

export const updateCampaign = async (
  campaignId: string,
  request: CampaignUpdateRequest,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.patch(`/api/campaigns/${campaignId}`, request);
  return data;
};

export const deleteCampaign = async (
  campaignId: string,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete(`/api/campaigns/${campaignId}`);
  return data;
};

export const closeRecruitment = async (
  campaignId: string,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post(`/api/campaigns/${campaignId}/close`);
  return data;
};
