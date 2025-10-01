'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { SignupForm } from '@/features/auth/components/signup-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="text-gray-600 mt-2">
            블로그 체험단에 오신 것을 환영합니다
          </p>
        </div>

        <SignupForm />

        <p className="text-sm text-center text-gray-600 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
}