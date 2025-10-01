'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CampaignCard as CampaignCardType } from '../lib/dto';

const calculateDDay = (endDate: string): string => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-Day';
  if (diffDays < 0) return '마감';
  return `D-${diffDays}`;
};

type CampaignCardProps = {
  campaign: CampaignCardType;
};

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const dDay = calculateDDay(campaign.end_date);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] bg-gray-100">
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant={dDay === '마감' ? 'secondary' : 'default'}
              className="font-bold"
            >
              {dDay}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{campaign.category}</Badge>
            {campaign.region && (
              <Badge variant="outline">{campaign.region}</Badge>
            )}
            <Badge className="ml-auto">모집중</Badge>
          </div>

          <h3 className="font-bold text-lg line-clamp-2">{campaign.title}</h3>

          <p className="text-sm text-gray-600">{campaign.business_name}</p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              모집 인원: {campaign.current_applicants}/{campaign.total_recruits}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
