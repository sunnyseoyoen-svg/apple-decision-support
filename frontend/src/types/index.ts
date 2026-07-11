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