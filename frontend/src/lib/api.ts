import axios from 'axios';
import type { 
  HarvestInput, 
  AnalysisResult, 
  AnalysisHistory,
  StorageInfo,
  StorageDetail,
  CreateStorageInput,
  UpdateStorageInput,
  StorageAlert,
  QualityTrend,
  AIRecommendation,
} from '@/types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 출하시기 분석
export const analyzeHarvest = async (input: HarvestInput): Promise<AnalysisResult> => {
  const response = await api.post<AnalysisResult>('/analyze/harvest', input);
  return response.data;
};

export const getHistory = async (): Promise<AnalysisHistory[]> => {
  const response = await api.get<AnalysisHistory[]>('/history');
  return response.data;
};

export const getMockData = async (): Promise<{ varieties: any[]; prices: any[] }> => {
  const response = await api.get('/mock/data');
  return response.data;
};

// 저장고 관리
export const getStorages = async (params?: { status?: string; variety?: string; systemType?: string }): Promise<StorageInfo[]> => {
  const response = await api.get<StorageInfo[]>('/storage', { params });
  return response.data;
};

export const getStorageAlerts = async (): Promise<StorageAlert[]> => {
  const response = await api.get<StorageAlert[]>('/storage/alerts');
  return response.data;
};

export const getStorageDetail = async (storageId: string): Promise<StorageDetail> => {
  const response = await api.get<StorageDetail>(`/storage/${storageId}`);
  return response.data;
};

export const createStorage = async (input: CreateStorageInput): Promise<StorageInfo> => {
  const response = await api.post<StorageInfo>('/storage', input);
  return response.data;
};

export const updateStorage = async (storageId: string, input: UpdateStorageInput): Promise<StorageInfo> => {
  const response = await api.put<StorageInfo>(`/storage/${storageId}`, input);
  return response.data;
};

export const deleteStorage = async (storageId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/storage/${storageId}`);
  return response.data;
};

export const getQualityTrend = async (storageId: string): Promise<QualityTrend[]> => {
  const response = await api.get<QualityTrend[]>(`/storage/${storageId}/quality-trend`);
  return response.data;
};

export const getAIRecommendation = async (storageId: string): Promise<AIRecommendation> => {
  const response = await api.get<AIRecommendation>(`/storage/${storageId}/ai-recommendation`);
  return response.data;
};

export default api;