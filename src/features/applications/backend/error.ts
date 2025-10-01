export const applicationErrorCodes = {
  duplicateApplication: 'DUPLICATE_APPLICATION',
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  campaignClosed: 'CAMPAIGN_CLOSED',
  campaignStillRecruiting: 'CAMPAIGN_STILL_RECRUITING',
  applicationCreationFailed: 'APPLICATION_CREATION_FAILED',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  onboardingIncomplete: 'ONBOARDING_INCOMPLETE',
  noSnsChannels: 'NO_SNS_CHANNELS',
  invalidVisitDate: 'INVALID_VISIT_DATE',
  applicationNotFound: 'APPLICATION_NOT_FOUND',
  applicationUpdateFailed: 'APPLICATION_UPDATE_FAILED',
} as const;

export type ApplicationErrorCode =
  (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];
