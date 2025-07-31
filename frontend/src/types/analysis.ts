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
  company: CompanyInfo;
  recommendation: string;
  confidence_score: number;
  target_price?: number;
  overall_score: number;
  analysis_date: string;
  analysis_data: {
    financial_data: any;
    key_ratios: any;
    business_analysis: any;
    risk_assessment: any;
    valuation_metrics: any;
    final_recommendation: any;
  };
}