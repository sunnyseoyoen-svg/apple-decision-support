export const VARIETY_OPTIONS = [
  { value: 'busa', label: '부사 (후지)', harvestSeason: '10월 하순~11월 상순' },
  { value: 'hongro', label: '홍로', harvestSeason: '9월 상순~9월 하순' },
  { value: 'gamhong', label: '감홍', harvestSeason: '10월 상순~10월 하순' },
  { value: 'yangkwang', label: '양광', harvestSeason: '9월 하순~10월 상순' },
  { value: 'shinano-sweet', label: '시나노스위트', harvestSeason: '10월 상순~10월 하순' },
] as const;

export const STORAGE_TYPE_OPTIONS = [
  { value: 'CA', label: 'CA 저장 (제어대기 저장)', description: '산소 2%, 이산화탄소 2% 제어' },
  { value: 'NORMAL', label: '일반 저온 저장', description: '0~5℃ 일반 냉장 저장' },
] as const;

export const APPEARANCE_OPTIONS = [
  { value: 'excellent', label: '우수 (무결점)', description: '상처, 변색 없음' },
  { value: 'good', label: '양호 (미세 상처)', description: '미세한 긁힘 정도' },
  { value: 'fair', label: '보통 (상처/변색)', description: '눈에 띄는 상처 또는 변색' },
] as const;

export const BRIX_THRESHOLDS = {
  excellent: 15.0,
  good: 13.5,
  fair: 12.0,
} as const;

export const FIRMNESS_THRESHOLDS = {
  excellent: 8.0,
  good: 7.0,
  fair: 6.0,
} as const;

export const VARIETY_STORAGE_LIMITS = {
  busa: { CA: 150, NORMAL: 90 },
  hongro: { CA: 90, NORMAL: 60 },
  gamhong: { CA: 120, NORMAL: 75 },
  yangkwang: { CA: 100, NORMAL: 65 },
  'shinano-sweet': { CA: 110, NORMAL: 70 },
} as const;

export const GRADE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  IMMEDIATE: { 
    label: '지금 출하 강력 추천', 
    description: '품질 한계 임박, 즉시 출하 필요', 
    color: 'bg-red-100 text-red-700 border-red-200' 
  },
  SOON: { 
    label: '1~2주 내 출하 권장', 
    description: '품질 저하 시작, 빠른 출하 유리', 
    color: 'bg-orange-100 text-orange-700 border-orange-200' 
  },
  MONITOR: { 
    label: '가격 관망 후 출하', 
    description: '여유 저장 가능, 가격 상승 대기', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
  },
  LONG_TERM: { 
    label: '장기 저장 후 출하', 
    description: '품질 우수, 명절/성수기 노림', 
    color: 'bg-green-100 text-green-700 border-green-200' 
  },
};

export const RECOMMENDATION_GRADES = [
  'IMMEDIATE',
  'SOON',
  'MONITOR',
  'LONG_TERM',
] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';