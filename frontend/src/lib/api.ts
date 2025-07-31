// frontend/src/lib/api.ts
import axios from 'axios';
import type { CompanyImages, CompanyInfo, AnalysisResponse } from '../types/images';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Functions
export const analysisApi = {
  startAnalysis: async (ticker: string) => {
    const response = await api.post(`/api/analysis/start/${ticker}`);
    return response.data;
  },
  
  getResults: async (ticker: string): Promise<AnalysisResponse> => {
    const response = await api.get(`/api/analysis/results/${ticker}`);
    return response.data;
  }
};

export const companiesApi = {
  search: async (query: string): Promise<CompanyInfo[]> => {
    const response = await api.get(`/api/companies/search?q=${query}`);
    return response.data;
  }
};

export const watchlistApi = {
  add: async (companyId: number, analysisId: number) => {
    const response = await api.post(`/api/watchlist/add?company_id=${companyId}&analysis_id=${analysisId}&user_id=1`);
    return response.data;
  },
  
  get: async () => {
    const response = await api.get('/api/watchlist/');
    return response.data;
  },

  remove: async (companyId: number) => {
    const response = await api.delete(`/api/watchlist/${companyId}`);
    return response.data;
  }
};

// Re-export types for backwards compatibility
export type { CompanyImages, CompanyInfo, AnalysisResponse };