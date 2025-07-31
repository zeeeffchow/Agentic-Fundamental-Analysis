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
import { AIImageService, type CompanyImages } from '../lib/aiImageService';
import { useImageLoader } from '../hooks/useImageLoader';

export const AnalysisResults: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyImages, setCompanyImages] = useState<CompanyImages | null>(null);

  useEffect(() => {
    if (ticker) {
      fetchAnalysis(ticker);
    }
  }, [ticker]);

  useEffect(() => {
    if (analysis?.company_images) {
      setCompanyImages(analysis.company_images);
      console.log('Company images loaded:', analysis.company_images); // Debug log
    }
  }, [analysis]);

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
      case 'BUY': return 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100';
      case 'SELL': return 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100';
      default: return 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100';
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

  const CompanyHeader: React.FC<{ analysis: AnalysisResponse; companyImages: CompanyImages | null }> = ({ 
    analysis, 
    companyImages 
  }) => {
    const fallbackLogo = AIImageService.generateFallbackLogo(analysis.company.ticker);
    const logoUrl = companyImages?.logo_urls?.[0] || null;
    
    const { currentUrl: displayLogoUrl, isLoading: logoLoading } = useImageLoader(
      logoUrl,
      fallbackLogo
    );

    return (
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm overflow-hidden">
                {logoLoading ? (
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <img 
                    src={displayLogoUrl} 
                    alt={`${analysis.company.ticker} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Final fallback if image fails to load
                      e.currentTarget.src = fallbackLogo;
                    }}
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {analysis.company.ticker}
                </h1>
                <p className="text-gray-600 text-sm">
                  {analysis.company.company_name || 'Analysis Results'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200',
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <TopBar onOpenWatchlist={() => setIsSidebarOpen(true)} />
      
      {analysis && (
        <CompanyHeader analysis={analysis} companyImages={companyImages} />
      )}

      {/* Enhanced Tabs with Theme Colors */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="w-full">
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <div className="grid grid-cols-6 max-w-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center justify-center py-4 px-3
                      border-b-2 transition-all duration-200 ease-out
                      hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent group
                      ${isActive 
                        ? 'border-blue-500 bg-gradient-to-b from-blue-50/50 to-transparent text-blue-600' 
                        : 'border-transparent text-gray-600 hover:text-blue-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <span className={`
                      text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-600 group-hover:text-blue-700'
                      }
                    `}>
                      {tab.label}
                    </span>
                    
                    {/* Enhanced Active Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Mobile Tabs */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max px-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center justify-center py-3 px-6 mx-1
                      border-b-2 transition-all duration-200 ease-out
                      hover:bg-blue-50 group min-w-[90px]
                      ${isActive 
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600' 
                        : 'border-transparent text-gray-600 hover:text-blue-700'
                      }
                    `}
                  >
                    <span className={`
                      text-sm font-medium transition-all duration-200 text-center whitespace-nowrap
                      ${isActive 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-600 group-hover:text-blue-700'
                      }
                    `}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section with Theme Background */}
      <div className="w-full px-4 py-8 bg-gradient-to-b from-transparent via-blue-50/30 to-indigo-50/20">
        <div key={activeTab} className="transition-opacity duration-300 ease-in-out">
          {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
          {activeTab === 'financial' && <FinancialTab analysis={analysis} />}
          {activeTab === 'business' && <BusinessTab analysis={analysis} />}
          {activeTab === 'risk' && <RiskTab analysis={analysis} />}
          {activeTab === 'valuation' && <ValuationTab analysis={analysis} />}
          {activeTab === 'management' && (
            <ManagementTabWithAIImages 
              analysis={analysis} 
              companyImages={companyImages || undefined} 
            />
          )}
        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>

  );
};

// ===== Tab Components =====

const OverviewTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const finalRec = analysis.analysis_data?.final_recommendation || {};
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Recommendation Card */}
      <div className="lg:col-span-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Investment Recommendation</h2>
          
          {/* Enhanced Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
              <div className="text-3xl font-bold text-blue-600 mb-2">{analysis.recommendation}</div>
              <div className="text-sm font-medium text-blue-700">Recommendation</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
              <div className="text-3xl font-bold text-green-600 mb-2">{(analysis.confidence_score * 100).toFixed(0)}%</div>
              <div className="text-sm font-medium text-green-700">Confidence</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/50">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{analysis.overall_score.toFixed(1)}/10</div>
              <div className="text-sm font-medium text-indigo-700">Overall Score</div>
            </div>
          </div>
          
          {/* Analysis Summary */}
          {finalRec.analysis_summary && (
            <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50">
              <h3 className="font-semibold mb-3 text-gray-900">Analysis Summary</h3>
              <p className="text-gray-700 leading-relaxed">{finalRec.analysis_summary}</p>
            </div>
          )}

          {/* Key Reasons */}
          {finalRec.key_reasons && (
            <div className="p-6 bg-gradient-to-br from-white to-blue-50/20 rounded-xl border border-blue-200/30">
              <h3 className="font-semibold mb-4 text-gray-900">Key Reasons</h3>
              <ul className="space-y-3">
                {finalRec.key_reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Sidebar */}
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="font-semibold mb-6 text-gray-900 text-lg">Key Metrics</h3>
          <div className="space-y-4">
            {analysis.target_price && (
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-lg border border-green-200/30">
                <span className="text-gray-700 font-medium">Target Price</span>
                <span className="font-bold text-green-600 text-lg">${analysis.target_price.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-lg border border-blue-200/30">
              <span className="text-gray-700 font-medium">Analysis Date</span>
              <span className="font-semibold text-blue-600">
                {new Date(analysis.analysis_date).toLocaleDateString()}
              </span>
            </div>
            {analysis.company.sector && (
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-lg border border-purple-200/30">
                <span className="text-gray-700 font-medium">Sector</span>
                <span className="font-semibold text-purple-600">{analysis.company.sector}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="font-semibold mb-4 text-white/90">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Market Cap</span>
              <span className="font-bold">$2.1T</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">P/E Ratio</span>
              <span className="font-bold">28.5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Dividend Yield</span>
              <span className="font-bold">0.52%</span>
            </div>
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
      {/* Financial Data Card - COMPLETE with all fields */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          Financial Data
        </h2>
        
        <div className="space-y-4">
          {financialData.revenue && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Revenue</span>
              <span className="font-bold text-blue-600 text-lg">${financialData.revenue.toLocaleString()}M</span>
            </div>
          )}
          {financialData.net_income && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Net Income</span>
              <span className="font-bold text-green-600 text-lg">${financialData.net_income.toLocaleString()}M</span>
            </div>
          )}
          {financialData.free_cash_flow && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Free Cash Flow</span>
              <span className="font-bold text-purple-600 text-lg">${financialData.free_cash_flow.toLocaleString()}M</span>
            </div>
          )}
          {/* ADDED: Missing fields from schema */}
          {financialData.total_equity && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-xl border border-indigo-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Total Equity</span>
              <span className="font-bold text-indigo-600 text-lg">${financialData.total_equity.toLocaleString()}M</span>
            </div>
          )}
          {financialData.total_debt && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-red-50 to-rose-50/30 rounded-xl border border-red-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Total Debt</span>
              <span className="font-bold text-red-600 text-lg">${financialData.total_debt.toLocaleString()}M</span>
            </div>
          )}
          {financialData.shares_outstanding && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-amber-50 to-orange-50/30 rounded-xl border border-amber-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Shares Outstanding</span>
              <span className="font-bold text-amber-600 text-lg">{financialData.shares_outstanding.toLocaleString()}M</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Ratios Card - COMPLETE with all fields */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          Key Ratios
        </h2>
        
        <div className="space-y-4">
          {keyRatios.roe && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Return on Equity</span>
              <span className="font-bold text-green-600 text-lg">{keyRatios.roe.toFixed(1)}%</span>
            </div>
          )}
          {keyRatios.net_margin && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Net Margin</span>
              <span className="font-bold text-blue-600 text-lg">{keyRatios.net_margin.toFixed(1)}%</span>
            </div>
          )}
          {keyRatios.debt_to_equity && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-amber-50 to-orange-50/30 rounded-xl border border-amber-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Debt to Equity</span>
              <span className="font-bold text-amber-600 text-lg">{keyRatios.debt_to_equity.toFixed(2)}</span>
            </div>
          )}
          {keyRatios.current_ratio && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">Current Ratio</span>
              <span className="font-bold text-purple-600 text-lg">{keyRatios.current_ratio.toFixed(2)}</span>
            </div>
          )}
          {/* ADDED: Missing field from schema */}
          {keyRatios.revenue_growth_3y && (
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-teal-50 to-cyan-50/30 rounded-xl border border-teal-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">3-Year Revenue Growth</span>
              <span className="font-bold text-teal-600 text-lg">{keyRatios.revenue_growth_3y.toFixed(1)}%</span>
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
            <Building className="h-6 w-6 text-green-600" />
          </div>
          Business Analysis
        </h2>
        
        {/* ADDED: Market Position - was missing */}
        {businessData.market_position && (
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50/30 rounded-xl border border-indigo-200/30">
            <h3 className="font-bold mb-3 text-lg text-gray-900">Market Position</h3>
            <p className="text-gray-700 leading-relaxed font-medium">{businessData.market_position}</p>
          </div>
        )}

        {/* Products & Services */}
        {businessData.products_services && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/30">
            <h3 className="font-bold mb-4 text-lg text-gray-900">Products & Services</h3>
            <div className="flex flex-wrap gap-3">
              {businessData.products_services.map((item: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Advantages */}
        {businessData.competitive_advantages && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30">
            <h3 className="font-bold mb-4 text-lg text-gray-900">Competitive Advantages</h3>
            <ul className="space-y-3">
              {businessData.competitive_advantages.map((advantage: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span className="text-gray-700 leading-relaxed font-medium">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ADDED: Growth Drivers - was missing */}
        {businessData.growth_drivers && (
          <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50/30 rounded-xl border border-teal-200/30">
            <h3 className="font-bold mb-4 text-lg text-gray-900">Growth Drivers</h3>
            <ul className="space-y-3">
              {businessData.growth_drivers.map((driver: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span className="text-gray-700 leading-relaxed font-medium">{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Competitors */}
        {businessData.key_competitors && (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50/30 rounded-xl border border-gray-200/30">
            <h3 className="font-bold mb-4 text-lg text-gray-900">Key Competitors</h3>
            <div className="flex flex-wrap gap-3">
              {businessData.key_competitors.map((competitor: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-gradient-to-r from-gray-600 to-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
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
    if (score <= 3) return 'from-green-500 to-emerald-500';
    if (score <= 6) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 3) return 'from-green-50 to-emerald-50/30 border-green-200/30';
    if (score <= 6) return 'from-amber-50 to-orange-50/30 border-amber-200/30';
    return 'from-red-50 to-rose-50/30 border-red-200/30';
  };

  const riskCategories = [
    { key: 'concentration_risk', label: 'Concentration Risk', icon: Target },
    { key: 'competition_risk', label: 'Competition Risk', icon: Users },
    { key: 'disruption_risk', label: 'Disruption Risk', icon: TrendingUp },
    { key: 'regulatory_risk', label: 'Regulatory Risk', icon: Shield },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-200 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        Risk Assessment
      </h2>
      
      {/* Risk Categories Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {riskCategories.map((category) => {
          const score = riskData[category.key];
          if (!score) return null;
          
          const Icon = category.icon;
          
          return (
            <div 
              key={category.key} 
              className={`p-6 bg-gradient-to-r ${getRiskBgColor(score)} rounded-xl border hover:shadow-md transition-all duration-200`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">{category.label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{score}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${getRiskColor(score)} transition-all duration-500 ease-out`}
                  style={{ width: `${(score / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Risk Score */}
      {riskData.overall_risk_score && (
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-xl border border-indigo-200/30 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">Overall Risk Score</span>
            <span className="text-3xl font-bold text-indigo-600">{riskData.overall_risk_score.toFixed(1)}/10</span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getRiskColor(riskData.overall_risk_score)} transition-all duration-500 ease-out`}
              style={{ width: `${(riskData.overall_risk_score / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Risk Summary */}
      {riskData.risk_summary && (
        <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50/30 rounded-xl border border-gray-200/30">
          <h3 className="font-bold mb-3 text-lg text-gray-900">Risk Summary</h3>
          <p className="text-gray-700 leading-relaxed">{riskData.risk_summary}</p>
        </div>
      )}
    </div>
  );
};

const ValuationTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const valuationData = analysis.analysis_data?.valuation_metrics || {};

  return (
    <div className="space-y-8">
      {/* Main Valuation Metrics */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          Valuation Metrics
        </h2>
        
        {/* Key Valuation Numbers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {valuationData.current_price && (
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">${valuationData.current_price.toFixed(2)}</div>
              <div className="text-sm font-medium text-blue-700">Current Price</div>
            </div>
          )}
          {valuationData.fair_value_estimate && (
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-3xl font-bold text-green-600 mb-2">${valuationData.fair_value_estimate.toFixed(2)}</div>
              <div className="text-sm font-medium text-green-700">Fair Value</div>
            </div>
          )}
          {valuationData.upside_downside && (
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
              <div className={`text-3xl font-bold mb-2 ${valuationData.upside_downside > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {valuationData.upside_downside > 0 ? '+' : ''}{valuationData.upside_downside.toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-purple-700">Upside/Downside</div>
            </div>
          )}
        </div>

        {/* ALL Valuation Ratios - INCLUDING MISSING ONES */}
        <div className="space-y-4">
          {valuationData.pe_ratio && (
            <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-xl border border-indigo-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">P/E Ratio</span>
              <span className="font-bold text-indigo-600 text-lg">{valuationData.pe_ratio.toFixed(1)}</span>
            </div>
          )}
          {valuationData.pfcf_ratio && (
            <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">P/FCF Ratio</span>
              <span className="font-bold text-green-600 text-lg">{valuationData.pfcf_ratio.toFixed(1)}</span>
            </div>
          )}
          {valuationData.pb_ratio && (
            <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">P/B Ratio</span>
              <span className="font-bold text-purple-600 text-lg">{valuationData.pb_ratio.toFixed(1)}</span>
            </div>
          )}
          {/* ADDED: Missing field from schema */}
          {valuationData.ev_revenue && (
            <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-teal-50 to-cyan-50/30 rounded-xl border border-teal-200/30 hover:shadow-md transition-all duration-200">
              <span className="text-gray-700 font-medium">EV/Revenue Ratio</span>
              <span className="font-bold text-teal-600 text-lg">{valuationData.ev_revenue.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ManagementTabWithAIImages: React.FC<{ 
  analysis: AnalysisResponse;
  companyImages?: CompanyImages;
}> = ({ analysis, companyImages }) => {
  const managementData = analysis.analysis_data?.management_analysis || {};
  
  // Get AI-powered CEO photo
  const ceoPhotoUrl = companyImages?.ceo_photo_urls?.[0] || null;
  const ceoFallbackUrl = managementData.ceo_name 
    ? AIImageService.generateCEOFallback(managementData.ceo_name)
    : null;
  
  const { currentUrl: displayCeoUrl, isLoading: ceoLoading } = useImageLoader(
    ceoPhotoUrl,
    ceoFallbackUrl || ''
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        Management Analysis
      </h2>

      {/* Management Summary at the Top */}
      {(managementData.management_quality || managementData.corporate_governance) && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl text-white">
          <h3 className="font-bold mb-4 text-white text-lg">Management Overview</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold mb-1">
                {managementData.management_quality ? 
                  (managementData.management_quality >= 8 ? 'Excellent' : 
                   managementData.management_quality >= 6 ? 'Good' : 
                   managementData.management_quality >= 4 ? 'Fair' : 'Poor') 
                  : 'N/A'}
              </div>
              <div className="text-blue-100 text-sm">Leadership Quality</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {managementData.corporate_governance ? 
                  (managementData.corporate_governance >= 8 ? 'Strong' : 
                   managementData.corporate_governance >= 6 ? 'Adequate' : 
                   managementData.corporate_governance >= 4 ? 'Weak' : 'Poor') 
                  : 'N/A'}
              </div>
              <div className="text-blue-100 text-sm">Governance Standards</div>
            </div>
            {managementData.ceo_tenure && (
              <div>
                <div className="text-2xl font-bold mb-1">
                  {managementData.ceo_tenure >= 10 ? 'Very Experienced' :
                   managementData.ceo_tenure >= 5 ? 'Experienced' :
                   managementData.ceo_tenure >= 2 ? 'Moderate' : 'New'}
                </div>
                <div className="text-blue-100 text-sm">CEO Experience</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {managementData.management_quality && (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Management Quality</h3>
              <div className="text-3xl font-bold text-blue-600">{managementData.management_quality}/10</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${(managementData.management_quality / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Leadership effectiveness and strategic vision</p>
          </div>
        )}
        
        {managementData.corporate_governance && (
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Corporate Governance</h3>
              <div className="text-3xl font-bold text-green-600">{managementData.corporate_governance}/10</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                style={{ width: `${(managementData.corporate_governance / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Board oversight and shareholder alignment</p>
          </div>
        )}
      </div>

      {/* CEO Details & Track Record with AI Photo */}
      {(managementData.ceo_name || managementData.ceo_tenure || managementData.track_record) && (
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50/30 rounded-xl border border-indigo-200/30">
          <h3 className="font-bold mb-4 text-lg text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            Leadership & Track Record
          </h3>
          
          {/* CEO Details with AI Photo */}
          {(managementData.ceo_name || managementData.ceo_tenure) && (
            <div className="mb-4 pb-4 border-b border-indigo-200/40">
              <div className="flex items-center gap-4">
                {/* AI-Powered CEO Photo */}
                {managementData.ceo_name && ceoFallbackUrl && (
                  <div className="flex-shrink-0">
                    {ceoLoading ? (
                      <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                    ) : (
                      <img 
                        src={displayCeoUrl} 
                        alt={managementData.ceo_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                        onError={(e) => {
                          // Final fallback
                          if (ceoFallbackUrl) {
                            e.currentTarget.src = ceoFallbackUrl;
                          }
                        }}
                      />
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-6">
                  {managementData.ceo_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm font-medium">CEO:</span>
                      <span className="font-semibold text-gray-900">{managementData.ceo_name}</span>
                    </div>
                  )}
                  {managementData.ceo_tenure && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm font-medium">Tenure:</span>
                      <span className="font-semibold text-gray-900">{managementData.ceo_tenure} years</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Track Record */}
          {managementData.track_record && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Performance Track Record</h4>
              <p className="text-gray-700 leading-relaxed">{managementData.track_record}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};