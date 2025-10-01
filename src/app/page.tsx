import { CampaignList } from '@/features/campaigns/components/campaign-list';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">체험단 모집</h1>
          <p className="text-gray-600">
            다양한 체험단에 참여하고 리뷰를 작성해보세요!
          </p>
        </div>

        <CampaignList />
      </div>
    </main>
  );
}
