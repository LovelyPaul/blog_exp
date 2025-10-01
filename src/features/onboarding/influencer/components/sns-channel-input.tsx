'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

type SNSChannel = {
  type?: 'naver' | 'youtube' | 'instagram' | 'threads';
  channel_name?: string;
  url?: string;
};

type SNSChannelInputProps = {
  channels: SNSChannel[];
  onChange: (channels: SNSChannel[]) => void;
  errors?: string[];
};

const SNS_TYPES = [
  { value: 'naver', label: '네이버 블로그' },
  { value: 'youtube', label: '유튜브' },
  { value: 'instagram', label: '인스타그램' },
  { value: 'threads', label: '스레드' },
] as const;

export const SNSChannelInput = ({
  channels,
  onChange,
  errors = [],
}: SNSChannelInputProps) => {
  const addChannel = () => {
    if (channels.length < 4) {
      onChange([
        ...channels,
        { type: 'naver', channel_name: '', url: '' },
      ]);
    }
  };

  const removeChannel = (index: number) => {
    onChange(channels.filter((_, i) => i !== index));
  };

  const updateChannel = (
    index: number,
    field: keyof SNSChannel,
    value: string,
  ) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>
          <span className="text-red-500">*</span> SNS 채널 (최대 4개)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChannel}
          disabled={channels.length >= 4}
        >
          + 채널 추가
        </Button>
      </div>

      {channels.map((channel, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <Label>채널 {index + 1}</Label>
            {channels.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChannel(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor={`type-${index}`}>플랫폼</Label>
            <Select
              value={channel.type || 'naver'}
              onValueChange={(value) =>
                updateChannel(index, 'type', value)
              }
            >
              <SelectTrigger id={`type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`channel-name-${index}`}>채널명</Label>
            <Input
              id={`channel-name-${index}`}
              value={channel.channel_name || ''}
              onChange={(e) =>
                updateChannel(index, 'channel_name', e.target.value)
              }
              placeholder="채널명을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor={`url-${index}`}>채널 URL</Label>
            <Input
              id={`url-${index}`}
              type="url"
              value={channel.url || ''}
              onChange={(e) =>
                updateChannel(index, 'url', e.target.value)
              }
              placeholder="https://"
            />
          </div>
        </div>
      ))}

      {errors.length > 0 && (
        <div className="text-sm text-red-500 space-y-1">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};
