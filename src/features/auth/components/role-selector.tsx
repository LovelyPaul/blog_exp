'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Role = 'influencer' | 'advertiser';

type RoleSelectorProps = {
  value?: Role;
  onChange: (role: Role) => void;
};

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">역할 선택</p>
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={cn(
            'p-4 cursor-pointer hover:border-primary transition-colors',
            value === 'influencer' && 'border-primary bg-primary/5',
          )}
          onClick={() => onChange('influencer')}
        >
          <h3 className="font-semibold">인플루언서</h3>
          <p className="text-sm text-gray-600">
            체험단에 지원하고 리뷰를 작성합니다
          </p>
        </Card>

        <Card
          className={cn(
            'p-4 cursor-pointer hover:border-primary transition-colors',
            value === 'advertiser' && 'border-primary bg-primary/5',
          )}
          onClick={() => onChange('advertiser')}
        >
          <h3 className="font-semibold">광고주</h3>
          <p className="text-sm text-gray-600">체험단을 등록하고 관리합니다</p>
        </Card>
      </div>
    </div>
  );
};