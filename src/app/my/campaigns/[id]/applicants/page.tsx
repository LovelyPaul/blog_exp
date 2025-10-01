'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CampaignApplicantsList } from '@/features/applications/components/campaign-applicants-list';
import { useCampaign } from '@/features/campaigns/hooks/useCampaign';
import { Skeleton } from '@/components/ui/skeleton';
import { closeRecruitment } from '@/features/campaigns/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignApplicantsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useCampaign(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseRecruitment = async () => {
    if (!confirm('모집을 조기 종료하시겠습니까? 종료 후에는 인플루언서를 선정할 수 있습니다.')) {
      return;
    }

    setIsClosing(true);
    try {
      await closeRecruitment(id);
      toast({
        title: '모집 종료',
        description: '모집이 성공적으로 종료되었습니다.',
      });
      // Refresh campaign data
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    } catch (error: any) {
      toast({
        title: '모집 종료 실패',
        description: error?.response?.data?.message || '모집 종료에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p>체험단을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/my/campaigns">
              <Button variant="outline" size="sm">
                ← 목록으로
              </Button>
            </Link>
            {campaign.status === 'recruiting' && (
              <Button
                variant="destructive"
                onClick={handleCloseRecruitment}
                disabled={isClosing}
              >
                {isClosing ? '종료 중...' : '모집 조기종료'}
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{campaign.title} - 지원자 관리</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">지원자를 확인하고 선정/탈락을 처리하세요</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                campaign.status === 'recruiting'
                  ? 'bg-green-100 text-green-700'
                  : campaign.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : campaign.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {campaign.status === 'recruiting'
                ? '모집 중'
                : campaign.status === 'in_progress'
                  ? '진행 중'
                  : campaign.status === 'completed'
                    ? '완료'
                    : '취소됨'}
            </span>
          </div>
          {campaign.status === 'recruiting' && (
            <p className="text-sm text-orange-600 mt-2">
              💡 모집을 종료해야 인플루언서를 선정할 수 있습니다.
            </p>
          )}
        </div>

        <CampaignApplicantsList campaignId={id} campaignStatus={campaign.status} />
      </div>
    </main>
  );
}
