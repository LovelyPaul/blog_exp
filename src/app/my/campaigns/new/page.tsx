'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignForm } from '@/features/campaigns/components/campaign-form';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';

export default function NewCampaignPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUserContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirectedFrom=/my/campaigns/new');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">체험단 등록</h1>
          <p className="text-gray-600">
            새로운 체험단을 등록하여 인플루언서를 모집하세요
          </p>
        </div>

        <CampaignForm mode="create" />
      </div>
    </main>
  );
}
