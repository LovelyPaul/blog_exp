import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  applicationErrorCodes,
  type ApplicationErrorCode,
} from './error';
import type {
  ApplicationRequest,
  ApplicationResponse,
  MyApplicationQuery,
  MyApplicationsResponse,
  MyApplicationItem,
  CampaignApplicantQuery,
  CampaignApplicantsResponse,
  CampaignApplicantItem,
  UpdateApplicationStatusRequest,
} from './schema';

export const createApplication = async (
  client: SupabaseClient,
  campaignId: string,
  influencerId: string,
  request: ApplicationRequest,
): Promise<
  HandlerResult<ApplicationResponse, ApplicationErrorCode, unknown>
> => {
  // 1. Check if campaign exists and is recruiting
  const { data: campaign, error: campaignError } = await client
    .from('campaigns')
    .select('id, status, end_date, total_recruits')
    .eq('id', campaignId)
    .is('deleted_at', null)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      applicationErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  // Check if campaign is still recruiting
  const endDate = new Date(campaign.end_date);
  const today = new Date();
  if (campaign.status !== 'recruiting' || endDate < today) {
    return failure(
      400,
      applicationErrorCodes.campaignClosed,
      '모집이 종료된 체험단입니다.',
    );
  }

  // 2. Check for duplicate application
  const { data: existingApplication } = await client
    .from('applications')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('influencer_id', influencerId)
    .is('deleted_at', null)
    .maybeSingle();

  if (existingApplication) {
    return failure(
      409,
      applicationErrorCodes.duplicateApplication,
      '이미 지원한 체험단입니다.',
    );
  }

  // 3. Check applicants count
  const { count: applicantsCount } = await client
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  if (applicantsCount !== null && applicantsCount >= campaign.total_recruits) {
    return failure(
      409,
      applicationErrorCodes.campaignClosed,
      '모집 인원이 마감되었습니다.',
    );
  }

  // 4. Validate visit date
  const visitDate = new Date(request.visit_date);
  if (visitDate < today || visitDate > endDate) {
    return failure(
      400,
      applicationErrorCodes.invalidVisitDate,
      '방문 희망 날짜는 오늘부터 모집 마감일까지만 선택 가능합니다.',
    );
  }

  // 5. Create application
  const { data, error } = await client
    .from('applications')
    .insert({
      campaign_id: campaignId,
      influencer_id: influencerId,
      message: request.message,
      visit_date: request.visit_date,
      selected_sns_channel: request.selected_sns_channel,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !data) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      '지원서 제출에 실패했습니다.',
    );
  }

  return success({
    applicationId: data.id,
    campaignId: data.campaign_id,
    status: data.status,
  });
};

export const getMyApplications = async (
  client: SupabaseClient,
  influencerId: string,
  query: MyApplicationQuery,
): Promise<
  HandlerResult<MyApplicationsResponse, ApplicationErrorCode, unknown>
> => {
  // Build query
  let supabaseQuery = client
    .from('applications')
    .select(
      `
      id,
      campaign_id,
      status,
      visit_date,
      created_at,
      message,
      selected_sns_channel,
      campaigns!inner(
        title,
        thumbnail_url,
        category,
        start_date,
        end_date,
        deleted_at,
        advertiser_id
      )
    `,
      { count: 'exact' },
    )
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status);
  }

  // Apply pagination
  supabaseQuery = supabaseQuery.range(
    query.offset,
    query.offset + query.limit - 1,
  );

  const { data, error, count } = await supabaseQuery;

  console.log('[getMyApplications] Query result:', {
    dataLength: data?.length,
    count,
    influencerId,
    hasError: !!error,
  });

  if (error) {
    console.error('[getMyApplications] Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      '지원 목록 조회 실패',
    );
  }

  // Get unique advertiser IDs
  const advertiserIds = [...new Set(data?.map((app: any) => app.campaigns.advertiser_id).filter(Boolean) || [])];

  console.log('[getMyApplications] Advertiser IDs:', advertiserIds);

  // Fetch advertiser profiles
  const { data: advertiserProfiles, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, business_name')
    .in('id', advertiserIds);

  if (profileError) {
    console.error('[getMyApplications] Advertiser profiles error:', {
      code: profileError.code,
      message: profileError.message,
    });
  }

  console.log('[getMyApplications] Advertiser profiles:', advertiserProfiles?.length);

  const advertiserMap = new Map(
    advertiserProfiles?.map((profile: any) => [profile.id, profile.business_name]) || []
  );

  const applications: MyApplicationItem[] =
    data?.map((app: any) => ({
      id: app.id,
      campaign_id: app.campaign_id,
      campaign_title: app.campaigns.title,
      campaign_thumbnail: app.campaigns.thumbnail_url,
      business_name: advertiserMap.get(app.campaigns.advertiser_id) || '',
      category: app.campaigns.category,
      status: app.status,
      visit_date: app.visit_date,
      created_at: app.created_at,
      message: app.message,
      selected_sns_channel: app.selected_sns_channel,
      campaign_start_date: app.campaigns.start_date,
      campaign_end_date: app.campaigns.end_date,
      campaign_deleted: !!app.campaigns.deleted_at,
    })) || [];

  console.log('[getMyApplications] Final applications:', applications.length);

  const total = count || 0;
  const hasMore = query.offset + query.limit < total;

  return success({
    applications,
    total,
    has_more: hasMore,
  });
};

export const getCampaignApplicants = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
  query: CampaignApplicantQuery,
): Promise<
  HandlerResult<CampaignApplicantsResponse, ApplicationErrorCode, unknown>
> => {
  // First, verify the campaign belongs to the advertiser
  const { data: campaign, error: campaignError } = await client
    .from('campaigns')
    .select('advertiser_id')
    .eq('id', campaignId)
    .is('deleted_at', null)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      applicationErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다.',
    );
  }

  if (campaign.advertiser_id !== advertiserId) {
    return failure(
      403,
      applicationErrorCodes.unauthorizedAccess,
      '이 체험단의 지원자를 조회할 권한이 없습니다.',
    );
  }

  // Build query
  let supabaseQuery = client
    .from('applications')
    .select(
      `
      id,
      influencer_id,
      status,
      visit_date,
      created_at,
      message,
      selected_sns_channel
    `,
      { count: 'exact' },
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status);
  }

  // Apply pagination
  supabaseQuery = supabaseQuery.range(
    query.offset,
    query.offset + query.limit - 1,
  );

  const { data, error, count } = await supabaseQuery;

  console.log('[getCampaignApplicants] Query result:', {
    dataLength: data?.length,
    count,
    campaignId,
    hasError: !!error,
  });

  if (error) {
    console.error('[getCampaignApplicants] Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      '지원자 목록 조회 실패',
    );
  }

  // Get unique influencer IDs
  const influencerIds = [...new Set(data?.map((app: any) => app.influencer_id).filter(Boolean) || [])];

  console.log('[getCampaignApplicants] Influencer IDs:', influencerIds);

  // Fetch influencer profiles
  const { data: influencerProfiles, error: profileError } = await client
    .from('influencer_profiles')
    .select('id, name')
    .in('id', influencerIds);

  if (profileError) {
    console.error('[getCampaignApplicants] Influencer profiles error:', {
      code: profileError.code,
      message: profileError.message,
    });
  }

  console.log('[getCampaignApplicants] Influencer profiles:', influencerProfiles?.length);

  const influencerMap = new Map(
    influencerProfiles?.map((profile: any) => [profile.id, profile.name]) || []
  );

  const applicants: CampaignApplicantItem[] =
    data?.map((app: any) => ({
      id: app.id,
      influencer_id: app.influencer_id,
      influencer_name: influencerMap.get(app.influencer_id) || '',
      status: app.status,
      visit_date: app.visit_date,
      created_at: app.created_at,
      message: app.message,
      selected_sns_channel: app.selected_sns_channel,
    })) || [];

  console.log('[getCampaignApplicants] Final applicants:', applicants.length);

  const total = count || 0;
  const hasMore = query.offset + query.limit < total;

  return success({
    applicants,
    total,
    has_more: hasMore,
  });
};

export const updateApplicationStatus = async (
  client: SupabaseClient,
  applicationId: string,
  advertiserId: string,
  request: UpdateApplicationStatusRequest,
): Promise<HandlerResult<{ success: boolean }, ApplicationErrorCode, unknown>> => {
  // First, verify the application's campaign belongs to the advertiser
  const { data: application, error: appError } = await client
    .from('applications')
    .select('campaign_id, campaigns!inner(advertiser_id, status)')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    return failure(
      404,
      applicationErrorCodes.applicationNotFound,
      '지원서를 찾을 수 없습니다.',
    );
  }

  if ((application as any).campaigns.advertiser_id !== advertiserId) {
    return failure(
      403,
      applicationErrorCodes.unauthorizedAccess,
      '이 지원서를 수정할 권한이 없습니다.',
    );
  }

  // Check if campaign recruitment has ended (only allow selection after recruitment ends)
  const campaignStatus = (application as any).campaigns.status;
  if (campaignStatus === 'recruiting') {
    return failure(
      400,
      applicationErrorCodes.campaignStillRecruiting,
      '모집이 진행 중인 체험단은 인플루언서를 선정할 수 없습니다. 먼저 모집을 종료해주세요.',
    );
  }

  // Update status
  const { error } = await client
    .from('applications')
    .update({ status: request.status })
    .eq('id', applicationId);

  if (error) {
    return failure(
      500,
      applicationErrorCodes.applicationUpdateFailed,
      '지원서 상태 변경에 실패했습니다.',
    );
  }

  return success({ success: true });
};
