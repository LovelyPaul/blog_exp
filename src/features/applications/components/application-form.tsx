'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateApplication } from '../hooks/useCreateApplication';
import { useCampaign } from '@/features/campaigns/hooks/useCampaign';
import { apiClient } from '@/lib/remote/api-client';
import {
  ApplicationRequestSchema,
  type ApplicationRequest,
} from '../lib/dto';

type SNSChannel = {
  type: 'naver' | 'youtube' | 'instagram' | 'threads';
  channel_name: string;
  url: string;
};

type ApplicationFormProps = {
  campaignId: string;
};

export const ApplicationForm = ({ campaignId }: ApplicationFormProps) => {
  const { data: campaign } = useCampaign(campaignId);
  const { mutate, isPending } = useCreateApplication(campaignId);
  const { toast } = useToast();
  const [snsChannels, setSnsChannels] = useState<SNSChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SNSChannel | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ApplicationRequest>({
    resolver: zodResolver(ApplicationRequestSchema),
  });

  const messageValue = watch('message') || '';

  // Fetch influencer profile for SNS channels
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/api/influencer/profile');
        if (data.sns_channels && Array.isArray(data.sns_channels)) {
          setSnsChannels(data.sns_channels);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleChannelSelect = (channel: SNSChannel) => {
    setSelectedChannel(channel);
    setValue('selected_sns_channel', channel);
  };

  const onSubmit = (data: ApplicationRequest) => {
    mutate(data, {
      onError: (error) => {
        toast({
          title: '지원 실패',
          description: error.message,
          variant: 'destructive',
        });
      },
      onSuccess: () => {
        toast({
          title: '지원 완료',
          description: '체험단 지원이 완료되었습니다.',
        });
      },
    });
  };

  if (!campaign) {
    return <div>로딩 중...</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const maxDate = campaign.end_date;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">체험단 지원</h2>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-lg">{campaign.title}</p>
          <p className="text-sm text-gray-600">{campaign.business_name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SNS Channel Selection */}
          <div>
            <Label>
              <span className="text-red-500">*</span> SNS 채널 선택
            </Label>
            {snsChannels.length === 0 ? (
              <p className="text-sm text-red-500 mt-2">
                등록된 SNS 채널이 없습니다. 먼저 프로필에서 SNS 채널을 등록해주세요.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 mt-2">
                {snsChannels.map((channel, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleChannelSelect(channel)}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      selectedChannel === channel
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{channel.channel_name}</p>
                    <p className="text-sm text-gray-600">{channel.type}</p>
                    <p className="text-xs text-gray-500 truncate">{channel.url}</p>
                  </button>
                ))}
              </div>
            )}
            {errors.selected_sns_channel && (
              <p className="text-sm text-red-500 mt-1">
                SNS 채널을 선택해주세요
              </p>
            )}
          </div>

          {/* Visit Date */}
          <div>
            <Label htmlFor="visit_date">
              <span className="text-red-500">*</span> 방문 희망 날짜
            </Label>
            <Input
              id="visit_date"
              type="date"
              min={today}
              max={maxDate}
              {...register('visit_date')}
            />
            {errors.visit_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.visit_date.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">
              <span className="text-red-500">*</span> 지원 메시지
            </Label>
            <textarea
              id="message"
              {...register('message')}
              className="w-full min-h-32 p-3 border rounded-md"
              placeholder="지원 동기와 체험단 참여 계획을 작성해주세요 (최소 10자, 최대 500자)"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>
              <p className="text-sm text-gray-500">{messageValue.length}/500</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || snsChannels.length === 0}
          >
            {isPending ? '지원 중...' : '지원하기'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
