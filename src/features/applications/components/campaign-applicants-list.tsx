'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaignApplicants } from '../hooks/useCampaignApplicants';
import { useUpdateApplicationStatus } from '../hooks/useUpdateApplicationStatus';
import { useQueryClient } from '@tanstack/react-query';

type StatusType = 'all' | 'pending' | 'selected' | 'rejected';

const STATUS_LABELS: Record<StatusType, string> = {
  all: '전체',
  pending: '대기중',
  selected: '선정됨',
  rejected: '탈락',
};

const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'default',
  selected: 'default',
  rejected: 'secondary',
};

const SNS_TYPE_LABELS: Record<string, string> = {
  naver: '네이버 블로그',
  youtube: '유튜브',
  instagram: '인스타그램',
  threads: '스레드',
};

interface CampaignApplicantsListProps {
  campaignId: string;
  campaignStatus: string;
}

export const CampaignApplicantsList = ({ campaignId, campaignStatus }: CampaignApplicantsListProps) => {
  const [activeTab, setActiveTab] = useState<StatusType>('all');
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCampaignApplicants(campaignId, {
      status: activeTab === 'all' ? undefined : activeTab,
      limit: 20,
    });

  const updateStatusMutation = useUpdateApplicationStatus();

  const allApplicants = data?.pages.flatMap((page) => page.applicants) || [];
  const totalCount = data?.pages[0]?.total || 0;

  const handleUpdateStatus = async (
    id: string,
    status: 'selected' | 'rejected',
    influencerName: string,
  ) => {
    const statusText = status === 'selected' ? '선정' : '탈락';
    if (!confirm(`${influencerName}님을 ${statusText} 처리하시겠습니까?`)) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ id, data: { status } });
      // refetch() 대신 캐시 무효화로 변경 - 더 빠르고 효율적
      queryClient.invalidateQueries({ queryKey: ['campaign-applicants', campaignId] });
    } catch (error: any) {
      alert(error.message || '상태 변경에 실패했습니다.');
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

      {/* Applicants List */}
      {allApplicants.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {activeTab === 'all'
              ? '아직 지원자가 없습니다.'
              : `${STATUS_LABELS[activeTab]} 지원자가 없습니다.`}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {allApplicants.map((applicant) => (
              <Card key={applicant.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {applicant.influencer_name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {SNS_TYPE_LABELS[applicant.selected_sns_channel.type]}
                      </Badge>
                      <Badge variant="outline">
                        {applicant.selected_sns_channel.channel_name}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANTS[applicant.status]}>
                    {applicant.status === 'pending' && '대기중'}
                    {applicant.status === 'selected' && '선정됨'}
                    {applicant.status === 'rejected' && '탈락'}
                  </Badge>
                </div>

                <div className="text-sm space-y-1 mb-4">
                  <p className="text-gray-600">
                    <span className="font-semibold">SNS 채널:</span>{' '}
                    <a
                      href={applicant.selected_sns_channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {applicant.selected_sns_channel.url}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">방문 희망일:</span>{' '}
                    {applicant.visit_date}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">지원일:</span>{' '}
                    {new Date(applicant.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                <div className="text-sm mb-4">
                  <p className="font-semibold mb-1">지원 메시지:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {applicant.message}
                  </p>
                </div>

                {applicant.status === 'pending' && (
                  <div className="space-y-2">
                    {campaignStatus === 'recruiting' && (
                      <p className="text-sm text-orange-600">
                        ⚠️ 모집 종료 후 선정/탈락 처리가 가능합니다.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            applicant.id,
                            'selected',
                            applicant.influencer_name,
                          )
                        }
                        disabled={updateStatusMutation.isPending || campaignStatus === 'recruiting'}
                      >
                        선정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            applicant.id,
                            'rejected',
                            applicant.influencer_name,
                          )
                        }
                        disabled={updateStatusMutation.isPending || campaignStatus === 'recruiting'}
                      >
                        탈락
                      </Button>
                    </div>
                  </div>
                )}
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
