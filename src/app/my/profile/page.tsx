'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';
import { useMe } from '@/features/auth/hooks/useMe';
import { InfluencerProfileForm } from '@/features/onboarding/influencer/components/influencer-profile-form';

export default function MyProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUserContext();
  const { data: meData, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && meData && meData.role !== 'influencer') {
      router.push('/');
    }
  }, [meData, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!meData || meData.role !== 'influencer') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>내 프로필 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <InfluencerProfileForm isEditMode />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
