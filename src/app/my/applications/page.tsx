import { MyApplicationsList } from '@/features/applications/components/my-applications-list';

export default function MyApplicationsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">내 지원 목록</h1>
          <p className="text-gray-600">
            지원한 체험단의 상태를 확인하세요
          </p>
        </div>

        <MyApplicationsList />
      </div>
    </main>
  );
}
