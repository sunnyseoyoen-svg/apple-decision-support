import axios from 'axios';
import type { HarvestInput, AnalysisResult, AnalysisHistory } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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

export default api;