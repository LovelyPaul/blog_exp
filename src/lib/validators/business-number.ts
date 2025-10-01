/**
 * 사업자등록번호 체크섬 검증
 * @param businessNumber 10자리 숫자 문자열 (하이픈 제거된 상태)
 * @returns 유효 여부
 */
export const validateBusinessNumber = (businessNumber: string): boolean => {
  // 하이픈 제거
  const cleaned = businessNumber.replace(/-/g, '');

  // 10자리 숫자인지 확인
  if (!/^\d{10}$/.test(cleaned)) {
    return false;
  }

  // 체크섬 알고리즘
  const digits = cleaned.split('').map(Number);
  const checkKey = [1, 3, 7, 1, 3, 7, 1, 3, 5];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * checkKey[i];
  }

  // 8번째 자리는 체크키를 곱한 후 10으로 나눈 몫을 더함
  sum += Math.floor((digits[8] * 5) / 10);

  // 체크섬 계산
  const checksum = (10 - (sum % 10)) % 10;

  return checksum === digits[9];
};

/**
 * 사업자번호에 하이픈 추가
 * @param businessNumber 사업자번호 (하이픈 포함/미포함)
 * @returns 123-45-67890 형식
 */
export const formatBusinessNumber = (businessNumber: string): string => {
  const cleaned = businessNumber.replace(/-/g, '');
  if (cleaned.length !== 10) return businessNumber;

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};
