'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdvertiserCampaignsList } from '@/features/campaigns/components/advertiser-campaigns-list';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';

export default function MyCampaignsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUserContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirectedFrom=/my/campaigns');
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">내 체험단 관리</h1>
            <p className="text-gray-600">
              등록한 체험단을 관리하고 지원자를 확인하세요
            </p>
          </div>
          <Link href="/my/campaigns/new">
            <Button>체험단 등록하기</Button>
          </Link>
        </div>

        <AdvertiserCampaignsList />
      </div>
    </main>
  );
}
