export type AppleVariety = 
  | 'busa' 
  | 'hongro' 
  | 'gamhong' 
  | 'yangkwang' 
  | 'shinano-sweet';

export type StorageType = 'CA' | 'NORMAL';

export type AppearanceGrade = 'excellent' | 'good' | 'fair';

export type RecommendationGrade = 
  | 'IMMEDIATE' 
  | 'SOON' 
  | 'MONITOR' 
  | 'LONG_TERM';

export interface HarvestInput {
  variety: string;
  harvestDate: string;
  storageDays: number;
  storageType: StorageType;
  brix: number;
  firmness: number;
  appearance: AppearanceGrade;
  expectedVolume: number;
  preferredPeriod?: string;
}

export interface AnalysisResult {
  recommendedDate: string;
  grade: RecommendationGrade;
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  qualityScore: number;
  remainingDays: number;
  priceTrend: 'rising' | 'stable' | 'falling';
}

export interface MockPriceData {
  variety: string;
  month: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface VarietyInfo {
  id: AppleVariety;
  name: string;
  harvestSeason: string;
  storageLimitCA: number;
  storageLimitNormal: number;
  typicalBrix: { min: number; max: number };
  typicalFirmness: { min: number; max: number };
}

export interface StorageRules {
  [key: string]: {
    ca: { baseLimit: number; qualityFactor: number };
    normal: { baseLimit: number; qualityFactor: number };
  };
}

export interface AnalysisHistory {
  id: number;
  input: HarvestInput;
  result: AnalysisResult;
  createdAt: string;
}

// ============================================
// 저장고 관리 타입
// ============================================

export type StorageSystemType = 'CA' | 'NORMAL';
export type StorageStatus = 'active' | 'warning' | 'critical' | 'empty';

export interface StorageInfo {
  id: string;
  name: string;
  systemType: StorageSystemType;
  capacity: number;      // 최대 용량 (톤)
  currentVolume: number; // 현재 저장량 (톤)
  appleVariety: string;
  harvestDate: string;
  storageStartDate: string;
  temperature: number;   // 현재 온도 (℃)
  humidity: number;      // 현재 습도 (%)
  co2: number;           // CO2 농도 (%)
  o2: number;            // O2 농도 (%)
  ethylene: number;      // 에틸렌 농도 (ppb)
  createdAt: string;
  updatedAt: string;
  // 계산된 필드들 (런타임에 추가됨)
  storageDays?: number;
  remainingDays?: number;
  utilizationRate?: number;
  status?: 'active' | 'warning' | 'critical' | 'empty';
  ripeningStage?: 'early' | 'progressing' | 'fast';
}

export interface QualityStatus {
  storageId: string;
  brix: number;           // 당도
  firmness: number;       // 경도
  appearance: AppearanceGrade;
  acidity: number;        // 산도
  internalBrowning: 'none' | 'slight' | 'moderate' | 'severe'; // 내부 갈변
  weightLoss: number;     // 무게 감소율 (%)
  measuredAt: string;
}

export interface QualityTrendData {
  date: string;
  brix: number;
  firmness: number;
  weightLoss: number;
}

export interface AIRecommendation {
  storageId: string;
  priority: 'high' | 'medium' | 'low';
  action: 'ship_now' | 'monitor' | 'adjust_env' | 'extend_storage';
  title: string;
  description: string;
  expectedOutcome: string;
  estimatedDate?: string;  // 예상 출하일
  priceImpact?: {
    current: number;
    predicted: number;
  };
  createdAt: string;
}

export interface StoragePriorityAlert {
  storageId: string;
  storageName: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  actionRequired: boolean;
}

export interface StorageWithDetails extends StorageInfo {
  qualityStatus?: QualityStatus;
  qualityTrend?: QualityTrendData[];
  aiRecommendation?: AIRecommendation;
  priorityAlert?: StoragePriorityAlert;
  utilizationRate: number; // 0-100
  remainingDays: number;   // 품질 유지 가능 잔여일
}

export interface CreateStorageInput {
  name: string;
  systemType: StorageSystemType;
  capacity: number;
  appleVariety: string;
  harvestDate: string;
  temperature: number;
  humidity: number;
  co2: number;
  o2: number;
}

export interface UpdateStorageInput {
  name?: string;
  currentVolume?: number;
  temperature?: number;
  humidity?: number;
  co2?: number;
  o2?: number;
}

// 추가: API 응답 타입
export interface StorageAlert {
  storageId: string;
  storageName: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  actionRequired: boolean;
}

export interface QualityTrend {
  date: string;
  brix: number;
  firmness: number;
  weightLoss: number;
}

export interface AIRecommendation {
  storageId: string;
  priority: 'high' | 'medium' | 'low';
  action: 'ship_now' | 'monitor' | 'adjust_env' | 'extend_storage';
  title: string;
  description: string;
  expectedOutcome: string;
  estimatedDate?: string;
  priceImpact?: {
    current: number;
    predicted: number;
  };
  createdAt: string;
}

export interface StorageDetail {
  storage: StorageInfo;
  qualityStatus?: QualityStatus;
  qualityTrend?: QualityTrend[];
  aiRecommendation?: AIRecommendation;
  priorityAlert?: StorageAlert;
  utilizationRate: number;
  remainingDays: number;
  ripeningStage: 'early' | 'progressing' | 'fast';
  status: 'active' | 'warning' | 'critical' | 'empty';
}