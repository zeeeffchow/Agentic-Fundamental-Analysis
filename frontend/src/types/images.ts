// frontend/src/types/images.ts
// Consolidated image types to avoid conflicts

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