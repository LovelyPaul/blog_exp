'use client';

import { ApplicationForm } from '@/features/applications/components/application-form';
import { use } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ApplicationPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ApplicationForm campaignId={id} />
      </div>
    </main>
  );
}
