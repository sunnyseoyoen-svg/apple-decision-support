"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HarvestInput {
  variety: string;
  harvestDate: string;
  storageDays: number;
  storageType: 'CA' | 'NORMAL';
  brix: number;
  firmness: number;
  appearance: 'excellent' | 'good' | 'fair';
  expectedVolume: number;
  preferredPeriod?: string;
}

const harvestSchema: z.ZodType<HarvestInput> = z.object({
  variety: z.string().min(1, '품종을 선택해주세요'),
  harvestDate: z.string().min(1, '수확일을 선택해주세요'),
  storageDays: z.coerce.number().min(0, '0 이상 입력해주세요').max(200, '200일 이하로 입력해주세요'),
  storageType: z.enum(['CA', 'NORMAL']),
  brix: z.coerce.number().min(8, '8 이상 입력해주세요').max(20, '20 이하로 입력해주세요'),
  firmness: z.coerce.number().min(3, '3 이상 입력해주세요').max(12, '12 이하로 입력해주세요'),
  appearance: z.enum(['excellent', 'good', 'fair']),
  expectedVolume: z.coerce.number().min(0.1, '0.1 이상 입력해주세요').max(100, '100 이하로 입력해주세요'),
  preferredPeriod: z.string().optional(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

const VARIETY_OPTIONS = [
  { value: 'busa', label: '부사 (후지)', harvestSeason: '10월 하순~11월 상순' },
  { value: 'hongro', label: '홍로', harvestSeason: '9월 중순~10월 상순' },
  { value: 'gamhong', label: '감홍', harvestSeason: '10월 상순~중순' },
  { value: 'yangkwang', label: '양광', harvestSeason: '9월 하순~10월 중순' },
  { value: 'sinano', label: '시나노스위트', harvestSeason: '10월 중순~하순' },
];

const STORAGE_TYPE_OPTIONS = [
  { value: 'CA', label: 'CA 저장 (제어 분위기 저장)' },
  { value: 'NORMAL', label: '일반 저온 저장' },
];

const APPEARANCE_OPTIONS = [
  { value: 'excellent', label: '우수 (무결점)' },
  { value: 'good', label: '양호 (미세 상처)' },
  { value: 'fair', label: '보통 (상처/변색 있음)' },
];

interface HarvestFormProps {
  onSubmit: (data: HarvestInput) => void;
  isLoading?: boolean;
}

export function HarvestForm({ onSubmit, isLoading }: HarvestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<HarvestInput>({
    resolver: zodResolver(harvestSchema as any),
    defaultValues: {
      variety: 'busa',
      harvestDate: '',
      storageDays: 30,
      storageType: 'CA',
      brix: 14.5,
      firmness: 7.5,
      appearance: 'good',
      expectedVolume: 5,
      preferredPeriod: '',
    },
  });

  const harvestDate = watch('harvestDate');
  const storageDays = watch('storageDays');

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variety">사과 품종</Label>
              <Select onValueChange={(v) => setValue('variety', v as any)}>
                <SelectTrigger id="variety">
                  <SelectValue placeholder="품종 선택" />
                </SelectTrigger>
                <SelectContent>
                  {VARIETY_OPTIONS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label} ({v.harvestSeason})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.variety && <p className="text-sm text-red-500">{errors.variety.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">수확일 <Calendar className="ml-1 h-4 w-4 inline" /></Label>
              <Input
                id="harvestDate"
                type="date"
                max={today}
                {...register('harvestDate')}
                className="cursor-pointer"
              />
              {errors.harvestDate && <p className="text-sm text-red-500">{errors.harvestDate.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storageDays">현재 저장 기간 (일)</Label>
              <Input
                id="storageDays"
                type="number"
                min="0"
                max="200"
                {...register('storageDays')}
              />
              {errors.storageDays && <p className="text-sm text-red-500">{errors.storageDays.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageType">저장 방식</Label>
              <Select onValueChange={(v) => setValue('storageType', v as any)}>
                <SelectTrigger id="storageType">
                  <SelectValue placeholder="저장 방식 선택" />
                </SelectTrigger>
                <SelectContent>
                  {STORAGE_TYPE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.storageType && <p className="text-sm text-red-500">{errors.storageType.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">현재 품질 상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="brix">당도 (Brix)</Label>
              <Input
                id="brix"
                type="number"
                step="0.1"
                min="8"
                max="20"
                placeholder="예: 14.5"
                {...register('brix')}
              />
              {errors.brix && <p className="text-sm text-red-500">{errors.brix.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmness">경도 (kg)</Label>
              <Input
                id="firmness"
                type="number"
                step="0.1"
                min="3"
                max="12"
                placeholder="예: 7.5"
                {...register('firmness')}
              />
              {errors.firmness && <p className="text-sm text-red-500">{errors.firmness.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appearance">외관 상태</Label>
              <Select onValueChange={(v) => setValue('appearance', v as any)}>
                <SelectTrigger id="appearance">
                  <SelectValue placeholder="외관 선택" />
                </SelectTrigger>
                <SelectContent>
                  {APPEARANCE_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appearance && <p className="text-sm text-red-500">{errors.appearance.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">출하 계획</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expectedVolume">예상 출하량 (톤)</Label>
              <Input
                id="expectedVolume"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                placeholder="예: 5"
                {...register('expectedVolume')}
              />
              {errors.expectedVolume && <p className="text-sm text-red-500">{errors.expectedVolume.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredPeriod">희망 출하 시기 (선택)</Label>
              <Input
                id="preferredPeriod"
                type="text"
                placeholder="예: 12월 중순, 설 명절 전"
                {...register('preferredPeriod')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" className="w-full md:w-[280px]" disabled={isLoading}>
          {isLoading ? '분석 중...' : 'AI 출하 분석 실행'}
        </Button>
      </div>
    </form>
  );
}
