const SNS_URL_PATTERNS: Record<string, RegExp> = {
  naver: /^https:\/\/blog\.naver\.com\/.+$/,
  youtube: /^https:\/\/(www\.)?youtube\.com\/@.+$/,
  instagram: /^https:\/\/(www\.)?instagram\.com\/.+$/,
  threads: /^https:\/\/(www\.)?threads\.net\/@.+$/,
};

export const validateSNSUrl = (type: string, url: string): boolean => {
  const pattern = SNS_URL_PATTERNS[type];
  return pattern ? pattern.test(url) : false;
};