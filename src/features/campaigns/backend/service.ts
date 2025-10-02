import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  campaignErrorCodes,
  type CampaignErrorCode,
} from './error';
import type {
  CampaignListQuery,
  CampaignListResponse,
  CampaignCard,
  CampaignDetail,
  CampaignCreateRequest,
  CampaignCreateResponse,
  CampaignUpdateRequest,
  AdvertiserCampaignQuery,
  AdvertiserCampaignListResponse,
  AdvertiserCampaignItem,
} from './schema';

export const getCampaigns = async (
  client: SupabaseClient,
  query: CampaignListQuery,
): Promise<
  HandlerResult<CampaignListResponse, CampaignErrorCode, unknown>
> => {
  // Build base query
  let supabaseQuery = client
    .from('campaigns')
    .select(
      `
      id,
      title,
      thumbnail_url,
      category,
      region,
      total_recruits,
      end_date,
      status,
      advertiser_id
    `,
      { count: 'exact' },
    )
    .eq('status', query.status)
    .gte('end_date', new Date().toISOString().split('T')[0]);

  // Apply filters
  if (query.category) {
    supabaseQuery = supabaseQuery.eq('category', query.category);
  }

  if (query.region) {
    supabaseQuery = supabaseQuery.eq('region', query.region);
  }

  if (query.search && query.search.length >= 2) {
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${query.search}%,benefits.ilike.%${query.search}%`,
    );
  }

  // Apply sorting
  switch (query.sort) {
    case 'deadline':
      supabaseQuery = supabaseQuery.order('end_date', { ascending: true });
      break;
    case 'popular':
      supabaseQuery = supabaseQuery.order('view_count', {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case 'latest':
    default:
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  supabaseQuery = supabaseQuery.range(
    query.offset,
    query.offset + query.limit - 1,
  );

  const { data, error, count } = await supabaseQuery;

  if (error) {
    console.error('[getCampaigns] Supabase error:', error);
    return failure(
      500,
      campaignErrorCodes.queryFailed,
      '체험단 목록 조회 실패',
      { supabaseError: error.message, code: error.code },
    );
  }

  // Get current applicants count for each campaign
  const campaignIds = data?.map((c) => c.id) || [];
  const { data: applicantsData } = await client
    .from('applications')
    .select('campaign_id')
    .in('campaign_id', campaignIds);

  const applicantsCounts: Record<string, number> = {};
  applicantsData?.forEach((app) => {
    applicantsCounts[app.campaign_id] =
      (applicantsCounts[app.campaign_id] || 0) + 1;
  });

  // Get advertiser profiles for all campaigns
  const advertiserIds = data?.map((c: any) => c.advertiser_id) || [];
  const { data: advertiserProfiles } = await client
    .from('advertiser_profiles')
    .select('user_id, business_name')
    .in('user_id', advertiserIds);

  const advertiserProfilesMap: Record<string, string> = {};
  advertiserProfiles?.forEach((profile: any) => {
    advertiserProfilesMap[profile.user_id] = profile.business_name;
  });

  const campaigns: CampaignCard[] =
    data?.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      thumbnail_url: campaign.thumbnail_url,
      business_name: advertiserProfilesMap[campaign.advertiser_id] || '알 수 없음',
      category: campaign.category,
      region: campaign.region,
      total_recruits: campaign.total_recruits,
      current_applicants: applicantsCounts[campaign.id] || 0,
      end_date: campaign.end_date,
      status: campaign.status,
    })) || [];

  const total = count || 0;
  const hasMore = query.offset + query.limit < total;

  return success({
    campaigns,
    total,
    has_more: hasMore,
  });
};

export const getCampaignById = async (
  client: SupabaseClient,
  campaignId: string,
): Promise<HandlerResult<CampaignDetail, CampaignErrorCode, unknown>> => {
  // Get campaign
  const { data, error } = await client
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !data) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  // Get advertiser profile separately
  const { data: advertiserProfile } = await client
    .from('advertiser_profiles')
    .select('business_name, category')
    .eq('user_id', data.advertiser_id)
    .single();

  // Get current applicants count
  const { count: applicantsCount } = await client
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  // Increment view count (fire and forget)
  client
    .from('campaigns')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', campaignId)
    .then(() => {});

  const campaign: CampaignDetail = {
    id: data.id,
    title: data.title,
    thumbnail_url: data.thumbnail_url,
    benefits: data.benefits,
    missions: data.missions,
    notes: data.notes,
    additional_images: data.additional_images,
    store_info: data.store_info,
    business_name: advertiserProfile?.business_name || '알 수 없음',
    business_category: advertiserProfile?.category || '',
    category: data.category,
    region: data.region,
    total_recruits: data.total_recruits,
    current_applicants: applicantsCount || 0,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
    view_count: data.view_count || 0,
    latitude: data.latitude,
    longitude: data.longitude,
  };

  return success(campaign);
};

export const createCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  data: CampaignCreateRequest,
): Promise<
  HandlerResult<CampaignCreateResponse, CampaignErrorCode, unknown>
> => {
  // Get advertiser profile ID
  const { data: profile } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', advertiserId)
    .single();

  if (!profile) {
    return failure(
      400,
      campaignErrorCodes.campaignCreationFailed,
      '광고주 프로필이 존재하지 않습니다.',
    );
  }

  // Generate a random seed for picsum.photos if no thumbnail provided
  const thumbnailUrl = data.thumbnail_url ||
    `https://picsum.photos/seed/${Date.now()}-${Math.random().toString(36).substring(7)}/800/600`;

  const { data: campaign, error } = await client
    .from('campaigns')
    .insert({
      advertiser_id: advertiserId,
      advertiser_profile_id: profile.id,
      title: data.title,
      thumbnail_url: thumbnailUrl,
      benefits: data.benefits,
      missions: data.missions,
      notes: data.notes || null,
      additional_images: data.additional_images || null,
      store_info: data.store_info || null,
      category: data.category,
      region: data.region || null,
      total_recruits: data.total_recruits,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'recruiting',
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      view_count: 0,
    })
    .select('id, created_at')
    .single();

  if (error || !campaign) {
    return failure(
      500,
      campaignErrorCodes.campaignCreationFailed,
      '체험단 생성에 실패했습니다.',
    );
  }

  return success({
    id: campaign.id,
    created_at: campaign.created_at,
  });
};

export const getAdvertiserCampaigns = async (
  client: SupabaseClient,
  advertiserId: string,
  query: AdvertiserCampaignQuery,
): Promise<
  HandlerResult<AdvertiserCampaignListResponse, CampaignErrorCode, unknown>
> => {
  let supabaseQuery = client
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });

  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status);
  }

  supabaseQuery = supabaseQuery.range(
    query.offset,
    query.offset + query.limit - 1,
  );

  const { data, error, count } = await supabaseQuery;

  if (error) {
    return failure(
      500,
      campaignErrorCodes.queryFailed,
      '캠페인 목록 조회 실패',
    );
  }

  const campaignIds = data?.map((c) => c.id) || [];
  const { data: applicantsData } = await client
    .from('applications')
    .select('campaign_id')
    .in('campaign_id', campaignIds);

  const applicantsCounts: Record<string, number> = {};
  applicantsData?.forEach((app) => {
    applicantsCounts[app.campaign_id] =
      (applicantsCounts[app.campaign_id] || 0) + 1;
  });

  const campaigns: AdvertiserCampaignItem[] =
    data?.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      thumbnail_url: campaign.thumbnail_url,
      category: campaign.category,
      region: campaign.region,
      total_recruits: campaign.total_recruits,
      current_applicants: applicantsCounts[campaign.id] || 0,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      status: campaign.status,
      view_count: campaign.view_count || 0,
      created_at: campaign.created_at,
    })) || [];

  const total = count || 0;
  const hasMore = query.offset + query.limit < total;

  return success({
    campaigns,
    total,
    has_more: hasMore,
  });
};

export const updateCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string,
  data: CampaignUpdateRequest,
): Promise<HandlerResult<{ success: boolean }, CampaignErrorCode, unknown>> => {
  // Check ownership
  const { data: existingCampaign, error: fetchError } = await client
    .from('campaigns')
    .select('advertiser_id')
    .eq('id', campaignId)
    .single();

  if (fetchError || !existingCampaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  if (existingCampaign.advertiser_id !== advertiserId) {
    return failure(
      403,
      campaignErrorCodes.unauthorized,
      '체험단을 수정할 권한이 없습니다.',
    );
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.thumbnail_url !== undefined) updateData.thumbnail_url = data.thumbnail_url || null;
  if (data.benefits !== undefined) updateData.benefits = data.benefits;
  if (data.missions !== undefined) updateData.missions = data.missions;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.additional_images !== undefined) updateData.additional_images = data.additional_images || null;
  if (data.store_info !== undefined) updateData.store_info = data.store_info || null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.region !== undefined) updateData.region = data.region || null;
  if (data.total_recruits !== undefined) updateData.total_recruits = data.total_recruits;
  if (data.start_date !== undefined) updateData.start_date = data.start_date;
  if (data.end_date !== undefined) updateData.end_date = data.end_date;
  if (data.latitude !== undefined) updateData.latitude = data.latitude || null;
  if (data.longitude !== undefined) updateData.longitude = data.longitude || null;

  const { error } = await client
    .from('campaigns')
    .update(updateData)
    .eq('id', campaignId);

  if (error) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      '체험단 수정에 실패했습니다.',
    );
  }

  return success({ success: true });
};

export const deleteCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string,
): Promise<HandlerResult<{ success: boolean }, CampaignErrorCode, unknown>> => {
  // Check ownership
  const { data: existingCampaign, error: fetchError } = await client
    .from('campaigns')
    .select('advertiser_id')
    .eq('id', campaignId)
    .single();

  if (fetchError || !existingCampaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  if (existingCampaign.advertiser_id !== advertiserId) {
    return failure(
      403,
      campaignErrorCodes.unauthorized,
      '체험단을 삭제할 권한이 없습니다.',
    );
  }

  // Soft delete
  const { error } = await client
    .from('campaigns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', campaignId);

  if (error) {
    return failure(
      500,
      campaignErrorCodes.campaignDeletionFailed,
      '체험단 삭제에 실패했습니다.',
    );
  }

  return success({ success: true });
};

export const closeRecruitment = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string,
): Promise<HandlerResult<{ success: boolean }, CampaignErrorCode, unknown>> => {
  // Check if campaign exists and belongs to advertiser
  const { data: existingCampaign, error: fetchError } = await client
    .from('campaigns')
    .select('id, advertiser_id, status')
    .eq('id', campaignId)
    .single();

  if (fetchError || !existingCampaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  if (existingCampaign.advertiser_id !== advertiserId) {
    return failure(
      403,
      campaignErrorCodes.unauthorized,
      '체험단 모집을 종료할 권한이 없습니다.',
    );
  }

  if (existingCampaign.status !== 'recruiting') {
    return failure(
      400,
      campaignErrorCodes.campaignNotRecruiting,
      '모집 중인 체험단만 조기 종료할 수 있습니다.',
    );
  }

  // Change status to in_progress
  const { error } = await client
    .from('campaigns')
    .update({ status: 'in_progress' })
    .eq('id', campaignId);

  if (error) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      '모집 종료에 실패했습니다.',
    );
  }

  return success({ success: true });
};
