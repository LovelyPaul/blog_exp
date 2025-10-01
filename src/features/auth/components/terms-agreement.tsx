'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type AgreementValues = {
  terms?: boolean;
  privacy?: boolean;
  marketing?: boolean;
};

type TermsAgreementProps = {
  values: AgreementValues;
  onChange: (field: keyof AgreementValues, value: boolean) => void;
};

export const TermsAgreement = ({
  values,
  onChange,
}: TermsAgreementProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">약관 동의</p>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={values.terms || false}
          onCheckedChange={(checked) => onChange('terms', checked === true)}
        />
        <Label htmlFor="terms" className="text-sm cursor-pointer">
          <span className="text-red-500">*</span> 이용약관 동의
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="privacy"
          checked={values.privacy || false}
          onCheckedChange={(checked) => onChange('privacy', checked === true)}
        />
        <Label htmlFor="privacy" className="text-sm cursor-pointer">
          <span className="text-red-500">*</span> 개인정보처리방침 동의
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing"
          checked={values.marketing || false}
          onCheckedChange={(checked) => onChange('marketing', checked === true)}
        />
        <Label htmlFor="marketing" className="text-sm cursor-pointer">
          마케팅 수신 동의 (선택)
        </Label>
      </div>
    </div>
  );
};