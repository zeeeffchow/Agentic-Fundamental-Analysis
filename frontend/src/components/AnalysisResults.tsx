import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Building,
  DollarSign,
  Shield,
  Users,
  BarChart3,
  Target
} from 'lucide-react';
import { analysisApi, type AnalysisResponse } from '../lib/api';
import { cn } from '../lib/utils';
import { WatchlistButton } from './WatchlistButton';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const AnalysisResults: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (ticker) {
      fetchAnalysis(ticker);
    }
  }, [ticker]);

  const fetchAnalysis = async (symbol: string) => {
    try {
      const result = await analysisApi.getResults(symbol);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to load analysis results');
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toUpperCase()) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toUpperCase()) {
      case 'BUY': return <TrendingUp className="h-5 w-5" />;
      case 'SELL': return <TrendingDown className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'financial', label: 'Financial', icon: BarChart3 },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'valuation', label: 'Valuation', icon: DollarSign },
    { id: 'management', label: 'Management', icon: Users },
  ];

  return (
    <div>
      <TopBar onOpenWatchlist={() => setIsSidebarOpen(true)} />
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-4 py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                    {analysis.company.ticker}
                    </h1>
                    <p className="text-gray-600">
                    {analysis.company.company_name || 'Analysis Results'}
                    </p>
                </div>
                </div>
                
                <div className="flex items-center gap-4">
                <div className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                    getRecommendationColor(analysis.recommendation)
                )}>
                    {getRecommendationIcon(analysis.recommendation)}
                    {analysis.recommendation}
                </div>
                <WatchlistButton 
                    companyId={analysis.company.id}
                    analysisId={analysis.id}
                />
                </div>
            </div>
        </div>
        {/* Add Sidebar before the closing div */}
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
        />
    </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-8">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'financial' && <FinancialTab analysis={analysis} />}
        {activeTab === 'business' && <BusinessTab analysis={analysis} />}
        {activeTab === 'risk' && <RiskTab analysis={analysis} />}
        {activeTab === 'valuation' && <ValuationTab analysis={analysis} />}
        {activeTab === 'management' && <ManagementTab analysis={analysis} />}
      </div>
    </div>
  );
};

// ===== Tab Components =====

const OverviewTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const finalRec = analysis.analysis_data?.final_recommendation || {};
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Recommendation */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Investment Recommendation</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analysis.recommendation}</div>
              <div className="text-sm text-gray-600">Recommendation</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(analysis.confidence_score * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analysis.overall_score.toFixed(1)}/10</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>
          
          {finalRec.analysis_summary && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Analysis Summary</h3>
              <p className="text-gray-700">{finalRec.analysis_summary}</p>
            </div>
          )}

          {finalRec.key_reasons && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Key Reasons</h3>
              <ul className="space-y-2">
                {finalRec.key_reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {analysis.target_price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Target Price</span>
                <span className="font-medium">${analysis.target_price.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Analysis Date</span>
              <span className="font-medium">
                {new Date(analysis.analysis_date).toLocaleDateString()}
              </span>
            </div>
            {analysis.company.sector && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sector</span>
                <span className="font-medium">{analysis.company.sector}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const financialData = analysis.analysis_data?.financial_data || {};
  const keyRatios = analysis.analysis_data?.key_ratios || {};

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">Financial Data</h2>
        <div className="space-y-4">
          {financialData.revenue && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">${financialData.revenue.toLocaleString()}M</span>
            </div>
          )}
          {financialData.net_income && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Net Income</span>
              <span className="font-medium">${financialData.net_income.toLocaleString()}M</span>
            </div>
          )}
          {financialData.free_cash_flow && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Free Cash Flow</span>
              <span className="font-medium">${financialData.free_cash_flow.toLocaleString()}M</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">Key Ratios</h2>
        <div className="space-y-4">
          {keyRatios.roe && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Return on Equity</span>
              <span className="font-medium">{keyRatios.roe.toFixed(1)}%</span>
            </div>
          )}
          {keyRatios.net_margin && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Net Margin</span>
              <span className="font-medium">{keyRatios.net_margin.toFixed(1)}%</span>
            </div>
          )}
          {keyRatios.debt_to_equity && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Debt to Equity</span>
              <span className="font-medium">{keyRatios.debt_to_equity.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BusinessTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const businessData = analysis.analysis_data?.business_analysis || {};

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">Business Analysis</h2>
        
        {businessData.products_services && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Products & Services</h3>
            <div className="flex flex-wrap gap-2">
              {businessData.products_services.map((item: string, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {businessData.competitive_advantages && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Competitive Advantages</h3>
            <ul className="space-y-2">
              {businessData.competitive_advantages.map((advantage: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {businessData.key_competitors && (
          <div>
            <h3 className="font-semibold mb-2">Key Competitors</h3>
            <div className="flex flex-wrap gap-2">
              {businessData.key_competitors.map((competitor: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {competitor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RiskTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const riskData = analysis.analysis_data?.risk_assessment || {};

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const riskCategories = [
    { key: 'concentration_risk', label: 'Concentration Risk' },
    { key: 'competition_risk', label: 'Competition Risk' },
    { key: 'disruption_risk', label: 'Disruption Risk' },
    { key: 'regulatory_risk', label: 'Regulatory Risk' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold mb-6">Risk Assessment</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {riskCategories.map((category) => {
          const score = riskData[category.key];
          if (!score) return null;
          
          return (
            <div key={category.key} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{category.label}</span>
                <span className="text-lg font-bold">{score}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getRiskColor(score)}`}
                  style={{ width: `${(score / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {riskData.overall_risk_score && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Overall Risk Score</span>
            <span className="text-xl font-bold">{riskData.overall_risk_score.toFixed(1)}/10</span>
          </div>
        </div>
      )}

      {riskData.risk_summary && (
        <div>
          <h3 className="font-semibold mb-2">Risk Summary</h3>
          <p className="text-gray-700">{riskData.risk_summary}</p>
        </div>
      )}
    </div>
  );
};

const ValuationTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const valuationData = analysis.analysis_data?.valuation_metrics || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold mb-6">Valuation Metrics</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {valuationData.current_price && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${valuationData.current_price.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Current Price</div>
          </div>
        )}
        {valuationData.fair_value_estimate && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${valuationData.fair_value_estimate.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Fair Value</div>
          </div>
        )}
        {valuationData.upside_downside && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${valuationData.upside_downside > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {valuationData.upside_downside > 0 ? '+' : ''}{valuationData.upside_downside.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Upside/Downside</div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {valuationData.pe_ratio && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">P/E Ratio</span>
            <span className="font-medium">{valuationData.pe_ratio.toFixed(1)}</span>
          </div>
        )}
        {valuationData.pfcf_ratio && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">P/FCF Ratio</span>
            <span className="font-medium">{valuationData.pfcf_ratio.toFixed(1)}</span>
          </div>
        )}
        {valuationData.pb_ratio && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">P/B Ratio</span>
            <span className="font-medium">{valuationData.pb_ratio.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ManagementTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const managementData = analysis.analysis_data?.management_analysis || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold mb-6">Management Analysis</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {managementData.management_quality && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{managementData.management_quality}/10</div>
            <div className="text-sm text-gray-600">Management Quality</div>
          </div>
        )}
        {managementData.corporate_governance && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{managementData.corporate_governance}/10</div>
            <div className="text-sm text-gray-600">Corporate Governance</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {managementData.ceo_name && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">CEO</span>
            <span className="font-medium">{managementData.ceo_name}</span>
          </div>
        )}
        {managementData.ceo_tenure && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">CEO Tenure</span>
            <span className="font-medium">{managementData.ceo_tenure} years</span>
          </div>
        )}
      </div>

      {managementData.track_record && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Track Record</h3>
          <p className="text-gray-700">{managementData.track_record}</p>
        </div>
      )}
    </div>
  );
};