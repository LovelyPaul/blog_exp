import { z } from 'zod';

export const EmailSchema = z
  .string()
  .email({ message: '유효한 이메일을 입력해주세요.' });