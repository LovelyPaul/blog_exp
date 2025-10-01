'use client';

import { CampaignDetail } from '@/features/campaigns/components/campaign-detail';
import { use } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function CampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CampaignDetail campaignId={id} />
      </div>
    </main>
  );
}
