'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-gray-600 mt-2">
            계정으로 로그인하세요
          </p>
        </div>

        <LoginForm />

        <p className="text-sm text-center text-gray-600 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
}