'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaign } from '../hooks/useCampaign';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const calculateDDay = (endDate: string): string => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘 마감';
  if (diffDays < 0) return '모집종료';
  return `D-${diffDays}`;
};

type CampaignDetailProps = {
  campaignId: string;
};

export const CampaignDetail = ({ campaignId }: CampaignDetailProps) => {
  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const { user, isAuthenticated } = useCurrentUser();
  const router = useRouter();

  const sanitizedBenefits = useMemo(() => {
    if (!campaign?.benefits) return '';
    return DOMPurify.sanitize(campaign.benefits, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }, [campaign?.benefits]);

  const sanitizedMissions = useMemo(() => {
    if (!campaign?.missions) return '';
    return DOMPurify.sanitize(campaign.missions, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }, [campaign?.missions]);

  const canApply = useMemo(() => {
    if (!campaign || !isAuthenticated || !user) return false;
    if (campaign.status !== 'recruiting') return false;
    if (campaign.current_applicants >= campaign.total_recruits) return false;

    const endDate = new Date(campaign.end_date);
    const today = new Date();
    return endDate >= today;
  }, [campaign, isAuthenticated, user]);

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/campaigns/${campaignId}`);
      return;
    }
    router.push(`/campaigns/${campaignId}/apply`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">체험단을 찾을 수 없습니다</h2>
        <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
      </div>
    );
  }

  const dDay = calculateDDay(campaign.end_date);
  const isRecruiting = campaign.status === 'recruiting' && dDay !== '모집종료';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thumbnail */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            {campaign.thumbnail_url ? (
              <Image
                src={campaign.thumbnail_url}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{campaign.category}</Badge>
              {campaign.region && <Badge variant="outline">{campaign.region}</Badge>}
              <Badge variant={isRecruiting ? 'default' : 'secondary'}>
                {isRecruiting ? '모집중' : '모집종료'}
              </Badge>
              <Badge variant={dDay === '모집종료' ? 'secondary' : 'destructive'}>
                {dDay}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold">{campaign.title}</h1>

            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-semibold">업체명:</span> {campaign.business_name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">모집 인원:</span>{' '}
                {campaign.current_applicants}/{campaign.total_recruits}명
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">모집 기간:</span>{' '}
                {campaign.start_date} ~ {campaign.end_date}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">조회수:</span> {campaign.view_count}회
              </p>
            </div>

            {canApply && (
              <Button onClick={handleApply} size="lg" className="w-full">
                지원하기
              </Button>
            )}
            {!isAuthenticated && isRecruiting && (
              <Button onClick={handleApply} size="lg" className="w-full" variant="outline">
                로그인하고 지원하기
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Benefits Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">제공 혜택</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedBenefits }}
        />
      </Card>

      {/* Missions Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">미션</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedMissions }}
        />
      </Card>

      {/* Notes Section */}
      {campaign.notes && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-bold mb-2">주의사항</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.notes}</p>
        </Card>
      )}

      {/* Additional Images */}
      {campaign.additional_images && campaign.additional_images.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">추가 이미지</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {campaign.additional_images.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`Additional image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Store Info */}
      {campaign.store_info && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">매장 정보</h2>
          <div className="space-y-2">
            {campaign.store_info.store_name && (
              <p>
                <span className="font-semibold">매장명:</span> {campaign.store_info.store_name}
              </p>
            )}
            {campaign.store_info.address && (
              <p>
                <span className="font-semibold">주소:</span> {campaign.store_info.address}
              </p>
            )}
            {campaign.store_info.phone && (
              <p>
                <span className="font-semibold">전화번호:</span> {campaign.store_info.phone}
              </p>
            )}
            {campaign.store_info.hours && (
              <p>
                <span className="font-semibold">영업시간:</span> {campaign.store_info.hours}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
