export const advertiserErrorCodes = {
  duplicateBusinessNumber: 'DUPLICATE_BUSINESS_NUMBER',
  invalidBusinessNumber: 'INVALID_BUSINESS_NUMBER',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  userUpdateFailed: 'USER_UPDATE_FAILED',
  profileNotFound: 'PROFILE_NOT_FOUND',
  invalidCategory: 'INVALID_CATEGORY',
  geocodingFailed: 'GEOCODING_FAILED',
} as const;

export type AdvertiserErrorCode =
  (typeof advertiserErrorCodes)[keyof typeof advertiserErrorCodes];
