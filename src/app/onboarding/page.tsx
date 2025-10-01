'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { apiClient } from '@/lib/remote/api-client';
import { InfluencerProfileForm } from '@/features/onboarding/influencer/components/influencer-profile-form';
import { AdvertiserProfileForm } from '@/features/onboarding/advertiser/components/advertiser-profile-form';

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<'influencer' | 'advertiser' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // users 테이블에서 역할 가져오기 (apiClient 사용으로 Authorization 헤더 자동 포함)
      try {
        const { data } = await apiClient.get('/api/auth/me');
        setRole(data.role);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        router.push('/login');
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (role === 'influencer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <InfluencerProfileForm />
      </div>
    );
  }

  if (role === 'advertiser') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AdvertiserProfileForm />
      </div>
    );
  }

  return null;
}
