import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CompanyInfo {
  id: number;
  ticker: string;
  company_name?: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
}

export interface AnalysisResponse {
  id: number;
  company: {
    id: number;
    ticker: string;
    company_name?: string;
    sector?: string;
  };
  analysis_data: {
    financial_data?: any;
    key_ratios?: any;
    business_analysis?: any;
    risk_assessment?: any;
    valuation_metrics?: any;
    management_analysis?: any;
    industry_analysis?: any;
    final_recommendation?: any;
  };
  recommendation: string;
  confidence_score: number;
  target_price?: number;
  overall_score: number;
  analysis_date: string;
  company_images?: CompanyImages;
}

export interface CompanyImages {
  ticker: string;
  logo_urls: string[];
  ceo_photo_urls: string[];
  fallback_logo_url: string;
  fallback_ceo_url?: string;
  company_info?: {
    ticker: string;
    company_name: string;
    website_domain: string;
    logo_description: string;
    ceo_name?: string;
    ceo_description?: string;
    founded_year?: number;
    headquarters?: string;
    industry_sector?: string;
  };
}

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