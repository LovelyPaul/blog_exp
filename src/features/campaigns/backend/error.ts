export const campaignErrorCodes = {
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  invalidStatus: 'INVALID_STATUS',
  queryFailed: 'QUERY_FAILED',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  campaignCreationFailed: 'CAMPAIGN_CREATION_FAILED',
  campaignUpdateFailed: 'CAMPAIGN_UPDATE_FAILED',
  campaignDeletionFailed: 'CAMPAIGN_DELETION_FAILED',
  campaignNotRecruiting: 'CAMPAIGN_NOT_RECRUITING',
  unauthorized: 'UNAUTHORIZED',
} as const;

export type CampaignErrorCode =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];
