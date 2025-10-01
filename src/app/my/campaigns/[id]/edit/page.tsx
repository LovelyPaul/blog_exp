'use client';

import { use } from 'react';
import { CampaignForm } from '@/features/campaigns/components/campaign-form';
import { useCampaign } from '@/features/campaigns/hooks/useCampaign';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCampaignPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useCampaign(id);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">체험단 수정</h1>
          <p className="text-gray-600">체험단 정보를 수정하세요</p>
        </div>

        <CampaignForm
          mode="edit"
          campaignId={id}
          defaultValues={{
            title: campaign.title,
            thumbnail_url: campaign.thumbnail_url,
            benefits: campaign.benefits,
            missions: campaign.missions,
            notes: campaign.notes || undefined,
            additional_images: campaign.additional_images || undefined,
            store_info: campaign.store_info || undefined,
            category: campaign.category,
            region: campaign.region || undefined,
            total_recruits: campaign.total_recruits,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            latitude: campaign.latitude || undefined,
            longitude: campaign.longitude || undefined,
          }}
        />
      </div>
    </main>
  );
}
