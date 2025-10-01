'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyApplications } from '../hooks/useMyApplications';

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

export const MyApplicationsList = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('all');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMyApplications({
      status: activeTab === 'all' ? undefined : activeTab,
      limit: 20,
    });

  const allApplications = data?.pages.flatMap((page) => page.applications) || [];
  const totalCount = data?.pages[0]?.total || 0;

  // Calculate counts per status
  const statusCounts = {
    all: totalCount,
    pending: allApplications.filter((a) => a.status === 'pending').length,
    selected: allApplications.filter((a) => a.status === 'selected').length,
    rejected: allApplications.filter((a) => a.status === 'rejected').length,
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
            {statusCounts[status] > 0 && (
              <span className="ml-2 text-sm">({statusCounts[status]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {allApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {activeTab === 'all'
              ? '아직 지원한 체험단이 없습니다.'
              : `${STATUS_LABELS[activeTab]} 지원이 없습니다.`}
          </p>
          <Link href="/">
            <Button variant="outline">체험단 탐색하기</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {allApplications.map((application) => (
              <Card key={application.id} className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {application.campaign_title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.business_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_BADGE_VARIANTS[application.status]}>
                          {application.status === 'pending' && '대기중'}
                          {application.status === 'selected' && '선정됨'}
                          {application.status === 'rejected' && '탈락'}
                        </Badge>
                        {application.campaign_deleted && (
                          <Badge variant="secondary">삭제됨</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{application.category}</Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        <span className="font-semibold">방문 희망:</span>{' '}
                        {application.visit_date}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">지원일:</span>{' '}
                        {new Date(application.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">모집 기간:</span>{' '}
                        {application.campaign_start_date} ~ {application.campaign_end_date}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p className="font-semibold mb-1">지원 메시지:</p>
                      <p className="text-gray-700 line-clamp-2">{application.message}</p>
                    </div>

                    <div className="flex gap-2">
                      {!application.campaign_deleted && (
                        <Link href={`/campaigns/${application.campaign_id}`}>
                          <Button variant="outline" size="sm">
                            체험단 보기
                          </Button>
                        </Link>
                      )}
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
