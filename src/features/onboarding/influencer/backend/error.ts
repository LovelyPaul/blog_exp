export const influencerErrorCodes = {
  duplicateSnsUrl: 'DUPLICATE_SNS_URL',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  profileUpdateFailed: 'PROFILE_UPDATE_FAILED',
  invalidSnsChannel: 'INVALID_SNS_CHANNEL',
  userUpdateFailed: 'USER_UPDATE_FAILED',
  profileNotFound: 'PROFILE_NOT_FOUND',
  invalidAge: 'INVALID_AGE',
} as const;

export type InfluencerErrorCode =
  (typeof influencerErrorCodes)[keyof typeof influencerErrorCodes];

export type InfluencerServiceError = {
  code: InfluencerErrorCode;
  message: string;
};