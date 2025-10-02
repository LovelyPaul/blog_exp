'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CampaignCreateRequestSchema, type CampaignCreateRequest } from '../lib/dto';
import { useCreateCampaign } from '../hooks/useCreateCampaign';
import { useUpdateCampaign } from '../hooks/useUpdateCampaign';

interface CampaignFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  defaultValues?: Partial<CampaignCreateRequest>;
}

export const CampaignForm = ({ mode, campaignId, defaultValues }: CampaignFormProps) => {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignCreateRequest>({
    resolver: zodResolver(CampaignCreateRequestSchema),
    defaultValues: defaultValues || {},
  });

  const onSubmit = async (data: CampaignCreateRequest) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
        alert('체험단이 등록되었습니다.');
        router.push('/my/campaigns');
      } else if (mode === 'edit' && campaignId) {
        await updateMutation.mutateAsync({ id: campaignId, data });
        alert('체험단이 수정되었습니다.');
        router.push('/my/campaigns');
      }
    } catch (error: any) {
      alert(error.message || '저장에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">기본 정보</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">체험단 제목</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="체험단 제목을 입력하세요"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="thumbnail_url">썸네일 URL (선택)</Label>
            <Input
              id="thumbnail_url"
              {...register('thumbnail_url')}
              placeholder="비워두면 자동으로 랜덤 이미지가 설정됩니다"
            />
            <p className="text-xs text-gray-500 mt-1">
              비워두면 자동으로 랜덤 이미지가 생성됩니다. 직접 입력하려면 https:// 로 시작하는 이미지 URL을 입력하세요.
            </p>
            {errors.thumbnail_url && (
              <p className="text-sm text-red-500 mt-1">{errors.thumbnail_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="예: 맛집, 뷰티, 여행 등"
            />
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="region">지역 (선택)</Label>
            <Input
              id="region"
              {...register('region')}
              placeholder="예: 서울, 경기 등"
            />
            {errors.region && (
              <p className="text-sm text-red-500 mt-1">{errors.region.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">체험단 내용</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="benefits">제공 혜택</Label>
            <textarea
              id="benefits"
              {...register('benefits')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="체험단에 제공되는 혜택을 입력하세요"
            />
            {errors.benefits && (
              <p className="text-sm text-red-500 mt-1">{errors.benefits.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="missions">미션 안내</Label>
            <textarea
              id="missions"
              {...register('missions')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="인플루언서가 수행할 미션을 입력하세요"
            />
            {errors.missions && (
              <p className="text-sm text-red-500 mt-1">{errors.missions.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">유의사항 (선택)</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="추가 유의사항을 입력하세요"
            />
            {errors.notes && (
              <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">매장 정보 (선택)</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="store_name">매장명</Label>
            <Input
              id="store_name"
              {...register('store_info.store_name')}
              placeholder="매장명을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              {...register('store_info.address')}
              placeholder="주소를 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              {...register('store_info.phone')}
              placeholder="전화번호를 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="hours">영업시간</Label>
            <Input
              id="hours"
              {...register('store_info.hours')}
              placeholder="영업시간을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="latitude">위도 (선택)</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register('latitude', {
                setValueAs: (v) => v === '' || v === null ? null : parseFloat(v)
              })}
              placeholder="37.5665"
            />
          </div>

          <div>
            <Label htmlFor="longitude">경도 (선택)</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register('longitude', {
                setValueAs: (v) => v === '' || v === null ? null : parseFloat(v)
              })}
              placeholder="126.9780"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">모집 정보</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="total_recruits">모집 인원</Label>
            <Input
              id="total_recruits"
              type="number"
              {...register('total_recruits', { valueAsNumber: true })}
              placeholder="모집 인원을 입력하세요"
            />
            {errors.total_recruits && (
              <p className="text-sm text-red-500 mt-1">{errors.total_recruits.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="start_date">모집 시작일</Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
            />
            {errors.start_date && (
              <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="end_date">모집 종료일</Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date')}
            />
            {errors.end_date && (
              <p className="text-sm text-red-500 mt-1">{errors.end_date.message}</p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? '저장 중...'
            : mode === 'create'
              ? '등록하기'
              : '수정하기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </div>
    </form>
  );
};
