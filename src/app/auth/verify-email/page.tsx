'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">이메일을 확인해주세요</h1>
            <p className="text-gray-600">
              회원가입이 완료되었습니다!
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">{email}</p>
                <p>
                  위 이메일 주소로 인증 링크를 발송했습니다.
                  이메일을 확인하시고 링크를 클릭해주세요.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 이메일이 도착하지 않았나요?</p>
              <p>• 스팸 메일함을 확인해보세요.</p>
              <p>• 잠시 후에 다시 시도해보세요.</p>
            </div>

            <Link href="/login">
              <Button className="w-full">
                로그인 페이지로 이동
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
