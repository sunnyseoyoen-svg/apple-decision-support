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

// ============================================
// 저장고 관리 상수 및 목업 데이터
// ============================================

export const STORAGE_SYSTEM_OPTIONS = [
  { value: 'CA', label: 'CA 저장 (제어대기)', description: '산소 2%, 이산화탄소 2% 제어', icon: '🌡️' },
  { value: 'NORMAL', label: '일반 저온 저장', description: '0~5℃ 일반 냉장 저장', icon: '❄️' },
] as const;

export const QUALITY_GRADE_COLORS = {
  excellent: 'bg-green-100 text-green-700 border-green-200',
  good: 'bg-blue-100 text-blue-700 border-blue-200',
  fair: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  poor: 'bg-red-100 text-red-700 border-red-200',
} as const;

export const STORAGE_STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
  empty: 'bg-gray-100 text-gray-700 border-gray-200',
} as const;

export const PRIORITY_LEVELS = {
  high: { label: '긴급', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' },
  medium: { label: '주의', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
  low: { label: '양호', color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' },
} as const;

export const RIPENING_STAGE_LABELS = {
  early: '초기',
  progressing: '진행 중',
  fast: '빠름',
} as const;

import type { StorageInfo } from "@/types";

export const MOCK_STORAGE_ROOMS: StorageInfo[] = [
  {
    id: 'STG-001',
    name: '1호 저장고 (CA)',
    systemType: 'CA' as const,
    capacity: 100,
    currentVolume: 85,
    appleVariety: 'busa',
    harvestDate: '2024-10-25',
    storageStartDate: '2024-10-28',
    temperature: 1.2,
    humidity: 92,
    co2: 2.1,
    o2: 2.3,
    ethylene: 15,
    createdAt: '2024-10-28T09:00:00',
    updatedAt: '2024-12-10T14:30:00',
  },
  {
    id: 'STG-002',
    name: '2호 저장고 (일반)',
    systemType: 'NORMAL' as const,
    capacity: 80,
    currentVolume: 60,
    appleVariety: 'hongro',
    harvestDate: '2024-09-20',
    storageStartDate: '2024-09-22',
    temperature: 3.5,
    humidity: 88,
    co2: 0.04,
    o2: 20.9,
    ethylene: 85,
    createdAt: '2024-09-22T10:00:00',
    updatedAt: '2024-12-10T14:25:00',
  },
  {
    id: 'STG-003',
    name: '3호 저장고 (CA)',
    systemType: 'CA' as const,
    capacity: 120,
    currentVolume: 95,
    appleVariety: 'gamhong',
    harvestDate: '2024-10-15',
    storageStartDate: '2024-10-18',
    temperature: 0.8,
    humidity: 94,
    co2: 1.9,
    o2: 2.0,
    ethylene: 8,
    createdAt: '2024-10-18T08:30:00',
    updatedAt: '2024-12-10T14:20:00',
  },
  {
    id: 'STG-004',
    name: '4호 저장고 (일반)',
    systemType: 'NORMAL' as const,
    capacity: 60,
    currentVolume: 15,
    appleVariety: 'yangkwang',
    harvestDate: '2024-09-25',
    storageStartDate: '2024-09-28',
    temperature: 4.2,
    humidity: 85,
    co2: 0.04,
    o2: 20.9,
    ethylene: 120,
    createdAt: '2024-09-28T11:00:00',
    updatedAt: '2024-12-10T14:15:00',
  },
] as const;

export const MOCK_QUALITY_STATUS: Record<string, {
  brix: number;
  firmness: number;
  appearance: 'excellent' | 'good' | 'fair';
  acidity: number;
  internalBrowning: 'none' | 'slight' | 'moderate' | 'severe';
  weightLoss: number;
  measuredAt: string;
}> = {
  'STG-001': {
    brix: 14.8,
    firmness: 7.5,
    appearance: 'good',
    acidity: 0.32,
    internalBrowning: 'none',
    weightLoss: 2.1,
    measuredAt: '2024-12-10T08:00:00',
  },
  'STG-002': {
    brix: 13.5,
    firmness: 6.8,
    appearance: 'fair',
    acidity: 0.38,
    internalBrowning: 'slight',
    weightLoss: 3.5,
    measuredAt: '2024-12-10T08:00:00',
  },
  'STG-003': {
    brix: 15.2,
    firmness: 8.1,
    appearance: 'excellent',
    acidity: 0.28,
    internalBrowning: 'none',
    weightLoss: 1.8,
    measuredAt: '2024-12-10T08:00:00',
  },
  'STG-004': {
    brix: 12.8,
    firmness: 6.2,
    appearance: 'fair',
    acidity: 0.42,
    internalBrowning: 'moderate',
    weightLoss: 4.2,
    measuredAt: '2024-12-10T08:00:00',
  },
};

export const MOCK_QUALITY_TRENDS: Record<string, Array<{
  date: string;
  brix: number;
  firmness: number;
  weightLoss: number;
}>> = {
  'STG-001': [
    { date: '2024-11-01', brix: 13.5, firmness: 8.5, weightLoss: 0.8 },
    { date: '2024-11-15', brix: 14.0, firmness: 8.2, weightLoss: 1.2 },
    { date: '2024-12-01', brix: 14.5, firmness: 7.8, weightLoss: 1.7 },
    { date: '2024-12-10', brix: 14.8, firmness: 7.5, weightLoss: 2.1 },
  ],
  'STG-002': [
    { date: '2024-10-15', brix: 13.0, firmness: 7.5, weightLoss: 1.5 },
    { date: '2024-11-01', brix: 13.3, firmness: 7.2, weightLoss: 2.2 },
    { date: '2024-11-15', brix: 13.4, firmness: 6.9, weightLoss: 2.8 },
    { date: '2024-12-10', brix: 13.5, firmness: 6.8, weightLoss: 3.5 },
  ],
  'STG-003': [
    { date: '2024-11-01', brix: 14.5, firmness: 8.5, weightLoss: 0.9 },
    { date: '2024-11-15', brix: 15.0, firmness: 8.3, weightLoss: 1.3 },
    { date: '2024-12-01', brix: 15.1, firmness: 8.2, weightLoss: 1.6 },
    { date: '2024-12-10', brix: 15.2, firmness: 8.1, weightLoss: 1.8 },
  ],
  'STG-004': [
    { date: '2024-10-15', brix: 12.5, firmness: 7.0, weightLoss: 2.0 },
    { date: '2024-11-01', brix: 12.6, firmness: 6.7, weightLoss: 2.8 },
    { date: '2024-11-15', brix: 12.7, firmness: 6.4, weightLoss: 3.5 },
    { date: '2024-12-10', brix: 12.8, firmness: 6.2, weightLoss: 4.2 },
  ],
};

export const MOCK_AI_RECOMMENDATIONS: Record<string, {
  priority: 'high' | 'medium' | 'low';
  action: 'ship_now' | 'monitor' | 'adjust_env' | 'extend_storage';
  title: string;
  description: string;
  expectedOutcome: string;
  estimatedDate?: string;
  priceImpact?: { current: number; predicted: number };
}> = {
  'STG-001': {
    priority: 'medium',
    action: 'monitor',
    title: '품질 양호 - 모니터링 지속',
    description: '당도 14.8°Bx, 경도 7.5kg로 품질 양호. CA 조건 안정적이나 경도 감소 추세 관찰 필요.',
    expectedOutcome: '현재 추세 유지 시 1월 중순까지 품질 유지 가능',
    estimatedDate: '2025-01-15',
    priceImpact: { current: 3200, predicted: 3800 },
  },
  'STG-002': {
    priority: 'high',
    action: 'ship_now',
    title: '즉시 출하 권장',
    description: '홍로 일반저장 79일차로 저장 한계(60일) 초과. 내부 갈변 시작, 경도 급감 중.',
    expectedOutcome: '금주 내 출하 시 상품성 확보 가능, 지연 시 부패 위험 급증',
    estimatedDate: '2024-12-13',
    priceImpact: { current: 2800, predicted: 2600 },
  },
  'STG-003': {
    priority: 'low',
    action: 'extend_storage',
    title: '장기 저장 유리 - 설 명절 노림',
    description: '감홍 CA저장 53일차, 당도 15.2°Bx, 경도 8.1kg로 최상급 품질. 저장 여유 67일.',
    expectedOutcome: '설 명절(1월 말) 출하 시 최고가 형성 예상',
    estimatedDate: '2025-01-25',
    priceImpact: { current: 3500, predicted: 4500 },
  },
  'STG-004': {
    priority: 'high',
    action: 'ship_now',
    title: '긴급 출하 필요',
    description: '양광 일반저장 73일차로 저장 한계(65일) 초과. 내부 갈변 중등도, 무게 감소 4.2%.',
    expectedOutcome: '즉시 선별 출하 필수, 지연 시 전량 폐기 위험',
    estimatedDate: '2024-12-12',
    priceImpact: { current: 2600, predicted: 2300 },
  },
};

export const MOCK_PRIORITY_ALERTS = [
  {
    storageId: 'STG-002',
    storageName: '2호 저장고 (일반)',
    level: 'critical' as const,
    message: '홍로 일반저장 79일차 - 저장 한계 19일 초과, 즉시 출하 필요',
    actionRequired: true,
  },
  {
    storageId: 'STG-004',
    storageName: '4호 저장고 (일반)',
    level: 'critical' as const,
    message: '양광 일반저장 73일차 - 저장 한계 8일 초과, 내부 갈변 진행 중',
    actionRequired: true,
  },
  {
    storageId: 'STG-001',
    storageName: '1호 저장고 (CA)',
    level: 'warning' as const,
    message: '경도 감소 추세 관찰 필요 - 주 1회 품질 측정 권장',
    actionRequired: false,
  },
];