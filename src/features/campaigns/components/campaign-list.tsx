'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignCard } from './campaign-card';
import type { CampaignListQuery } from '../lib/dto';

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'deadline', label: '마감임박순' },
  { value: 'popular', label: '인기순' },
] as const;

export const CampaignList = () => {
  const [filters, setFilters] = useState<Partial<CampaignListQuery>>({
    status: 'recruiting',
    sort: 'latest',
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCampaigns(filters);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 2 || search.length === 0) {
        setFilters((prev) => ({ ...prev, search: search || undefined }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCampaigns = data?.pages.flatMap((page) => page.campaigns) || [];
  const totalCount = data?.pages[0]?.total || 0;

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="체험단 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/3"
        />

        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sort: value as any }))
          }
        >
          <SelectTrigger className="md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.category || filters.region || filters.search ? (
          <Button
            variant="outline"
            onClick={() =>
              setFilters({ status: 'recruiting', sort: 'latest', limit: 20 })
            }
          >
            필터 초기화
          </Button>
        ) : null}
      </div>

      {/* Total count */}
      <p className="text-sm text-gray-600">총 {totalCount}개 체험단</p>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : allCampaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">모집 중인 체험단이 없습니다.</p>
          {(filters.category || filters.region || filters.search) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ status: 'recruiting', sort: 'latest', limit: 20 })
              }
            >
              필터 초기화
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && <Skeleton className="h-10 w-32" />}
            {!hasNextPage && allCampaigns.length > 0 && (
              <p className="text-sm text-gray-500">
                더 이상 체험단이 없습니다.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
