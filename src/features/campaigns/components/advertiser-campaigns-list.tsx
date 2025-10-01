'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdvertiserCampaigns } from '../hooks/useAdvertiserCampaigns';
import { useDeleteCampaign } from '../hooks/useDeleteCampaign';
import { useQueryClient } from '@tanstack/react-query';

type StatusType = 'all' | 'recruiting' | 'in_progress' | 'completed' | 'canceled';

const STATUS_LABELS: Record<StatusType, string> = {
  all: '전체',
  recruiting: '모집중',
  in_progress: '진행중',
  completed: '완료',
  canceled: '취소됨',
};

const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  recruiting: 'default',
  in_progress: 'default',
  completed: 'secondary',
  canceled: 'destructive',
};

export const AdvertiserCampaignsList = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('all');
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAdvertiserCampaigns({
      status: activeTab === 'all' ? undefined : activeTab,
      limit: 20,
    });

  const deleteMutation = useDeleteCampaign();

  const allCampaigns = data?.pages.flatMap((page) => page.campaigns) || [];
  const totalCount = data?.pages[0]?.total || 0;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 체험단을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      // refetch() 대신 캐시 무효화로 변경 - 더 빠르고 효율적
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    } catch (error: any) {
      alert(error.message || '삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {(Object.keys(STATUS_LABELS) as StatusType[]).map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === status
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {STATUS_LABELS[status]}
            {status === 'all' && totalCount > 0 && (
              <span className="ml-2 text-sm">({totalCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Campaigns List */}
      {allCampaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {activeTab === 'all'
              ? '등록된 체험단이 없습니다.'
              : `${STATUS_LABELS[activeTab]} 체험단이 없습니다.`}
          </p>
          <Link href="/my/campaigns/new">
            <Button>체험단 등록하기</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {allCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {campaign.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{campaign.category}</Badge>
                          {campaign.region && (
                            <Badge variant="outline">{campaign.region}</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANTS[campaign.status]}>
                        {campaign.status === 'recruiting' && '모집중'}
                        {campaign.status === 'in_progress' && '진행중'}
                        {campaign.status === 'completed' && '완료'}
                        {campaign.status === 'canceled' && '취소됨'}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        <span className="font-semibold">모집 인원:</span>{' '}
                        {campaign.current_applicants} / {campaign.total_recruits}명
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">모집 기간:</span>{' '}
                        {campaign.start_date} ~ {campaign.end_date}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">조회수:</span> {campaign.view_count}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">등록일:</span>{' '}
                        {new Date(campaign.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm">
                          미리보기
                        </Button>
                      </Link>
                      <Link href={`/my/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Link href={`/my/campaigns/${campaign.id}/applicants`}>
                        <Button variant="outline" size="sm">
                          지원자 관리
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(campaign.id, campaign.title)}
                        disabled={deleteMutation.isPending}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? '로딩 중...' : '더 보기'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
