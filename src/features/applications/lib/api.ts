import { apiClient } from '@/lib/remote/api-client';
import type {
  ApplicationRequest,
  ApplicationResponse,
  MyApplicationQuery,
  MyApplicationsResponse,
  CampaignApplicantQuery,
  CampaignApplicantsResponse,
  UpdateApplicationStatusRequest,
} from './dto';

export const postApplication = async (
  campaignId: string,
  data: ApplicationRequest,
): Promise<ApplicationResponse> => {
  const { data: responseData } = await apiClient.post(
    `/api/campaigns/${campaignId}/applications`,
    data,
  );
  return responseData;
};

export const getMyApplications = async (
  query: Partial<MyApplicationQuery>,
): Promise<MyApplicationsResponse> => {
  const { data } = await apiClient.get('/api/my/applications', {
    params: query,
  });
  return data;
};

export const getCampaignApplicants = async (
  campaignId: string,
  query: Partial<CampaignApplicantQuery>,
): Promise<CampaignApplicantsResponse> => {
  const { data } = await apiClient.get(`/api/campaigns/${campaignId}/applicants`, {
    params: query,
  });
  return data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  data: UpdateApplicationStatusRequest,
): Promise<{ success: boolean }> => {
  const { data: responseData } = await apiClient.patch(
    `/api/applications/${applicationId}/status`,
    data,
  );
  return responseData;
};
