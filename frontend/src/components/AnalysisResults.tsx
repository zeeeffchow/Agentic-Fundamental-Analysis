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
  Target,
  AlertTriangle,
  Star,
  Award, 
  Calendar,
  Zap,
  Lightbulb,
  PieChart,
  Calculator,
  Activity,
  CreditCard,
  Coins,
  Globe,
  Map,
  Briefcase,
  Crown,
  Scale,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Heart
} from 'lucide-react';
import { analysisApi } from '../lib/api';
import type { CompanyImages, AnalysisResponse } from '../types/images';
import { cn } from '../lib/utils';
import { WatchlistButton } from './WatchlistButton';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AIImageService } from '../lib/aiImageService';
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
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(true);
    
    // Generate fallback logo
    const fallbackLogo = AIImageService.generateFallbackLogo(analysis.company.ticker);
    
    // Load the best logo asynchronously
    useEffect(() => {
      const loadBestLogo = async () => {
        setLogoLoading(true);
        try {
          const bestLogo = await AIImageService.getBestLogo(analysis.company.ticker, companyImages);
          setLogoUrl(bestLogo);
        } catch (error) {
          console.error('Error loading logo:', error);
          setLogoUrl(fallbackLogo);
        } finally {
          setLogoLoading(false);
        }
      };

      loadBestLogo();
    }, [analysis.company.ticker, companyImages]);

    const { currentUrl: displayLogoUrl, isLoading: imageLoading } = useImageLoader(
      logoUrl,
      fallbackLogo
    );

    return (
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm overflow-hidden">
                {(logoLoading || imageLoading) ? (
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <img 
                    src={displayLogoUrl} 
                    alt={`${analysis.company.ticker} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Final fallback if image fails to load
                      console.warn(`Image failed to load: ${e.currentTarget.src}`);
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
            <ManagementAnalysis 
              analysis={analysis} 
              companyImages={companyImages} 
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
  // const financialData = analysis.analysis_data?.financial_data || {};
  const businessData = analysis.analysis_data?.business_analysis || {};
  const valuationData = analysis.analysis_data?.valuation_metrics || {};
  
  // const getRecommendationColor = (recommendation: string) => {
  //   switch (recommendation?.toUpperCase()) {
  //     case 'STRONG BUY': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  //     case 'BUY': return 'text-green-700 bg-green-50 border-green-200';
  //     case 'SELL': return 'text-red-700 bg-red-50 border-red-200';
  //     case 'STRONG SELL': return 'text-red-800 bg-red-100 border-red-300';
  //     default: return 'text-amber-700 bg-amber-50 border-amber-200';
  //   }
  // };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation?.toUpperCase()) {
      case 'STRONG BUY': return <TrendingUp className="h-6 w-6" />;
      case 'BUY': return <TrendingUp className="h-5 w-5" />;
      case 'SELL': return <TrendingDown className="h-5 w-5" />;
      case 'STRONG SELL': return <TrendingDown className="h-6 w-6" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  // const getConvictionBadge = (conviction: string) => {
  //   const colors = {
  //     'High': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  //     'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  //     'Low': 'bg-gray-100 text-gray-800 border-gray-200'
  //   };
  //   return colors[conviction as keyof typeof colors] || colors.Medium;
  // };

  return (
    <div className="space-y-8">
      {/* Hero Recommendation Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl shadow-2xl p-8 text-white">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Main Recommendation */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                {getRecommendationIcon(finalRec.recommendation || analysis.recommendation)}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {finalRec.recommendation || analysis.recommendation}
                </h1>
                <div className="flex items-center gap-4">
                  {finalRec.conviction_level && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/30">
                      {finalRec.conviction_level} Conviction
                    </span>
                  )}
                  <span className="text-blue-100">
                    Confidence: {Math.round((finalRec.confidence || analysis.confidence_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Investment Thesis Preview */}
            {finalRec.investment_thesis && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Investment Thesis
                </h3>
                <p className="text-blue-50 leading-relaxed">
                  {finalRec.investment_thesis.length > 300 
                    ? finalRec.investment_thesis.substring(0, 300) + '...' 
                    : finalRec.investment_thesis}
                </p>
              </div>
            )}
          </div>

          {/* Price Targets */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Price Targets
            </h3>
            
            {finalRec.price_target_range ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Bull Case</span>
                  <span className="font-bold text-xl text-green-300">
                    ${finalRec.price_target_range.bull?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Base Case</span>
                  <span className="font-bold text-xl">
                    ${finalRec.price_target_range.base?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Bear Case</span>
                  <span className="font-bold text-xl text-red-300">
                    ${finalRec.price_target_range.bear?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                
                {/* Current Price vs Base Target */}
                {valuationData.current_price && finalRec.price_target_range.base && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Current Price</span>
                      <span className="font-bold">${valuationData.current_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-100">Potential Upside</span>
                      <span className={`font-bold ${
                        ((finalRec.price_target_range.base - valuationData.current_price) / valuationData.current_price * 100) > 0 
                          ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {(((finalRec.price_target_range.base - valuationData.current_price) / valuationData.current_price) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  ${(finalRec.target_price || analysis.target_price || 0).toFixed(2)}
                </div>
                <div className="text-blue-100 text-sm">12-Month Target</div>
              </div>
            )}
            
            {finalRec.time_horizon && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{finalRec.time_horizon}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        {(finalRec.overall_score || analysis.overall_score) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(finalRec.overall_score || analysis.overall_score || 0).toFixed(1)}/10
            </div>
            <div className="text-sm font-medium text-gray-600">Overall Score</div>
          </div>
        )}

        {/* Quality Score */}
        {finalRec.quality_score && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {finalRec.quality_score.toFixed(1)}/10
            </div>
            <div className="text-sm font-medium text-gray-600">Quality Score</div>
          </div>
        )}

        {/* Growth Score */}
        {finalRec.growth_score && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {finalRec.growth_score.toFixed(1)}/10
            </div>
            <div className="text-sm font-medium text-gray-600">Growth Score</div>
          </div>
        )}

        {/* Valuation Score */}
        {finalRec.valuation_score && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {finalRec.valuation_score.toFixed(1)}/10
            </div>
            <div className="text-sm font-medium text-gray-600">Valuation Score</div>
          </div>
        )}
      </div>

      {/* Key Reasons and Catalysts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Investment Reasons */}
        {finalRec.key_reasons && finalRec.key_reasons.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              Key Investment Reasons
            </h3>
            <div className="space-y-4">
              {finalRec.key_reasons.slice(0, 3).map((reason: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-lg border border-green-200/30">
                  <h4 className="font-semibold text-green-800 mb-2">
                    {typeof reason === 'object' ? reason.reason : reason}
                  </h4>
                  {typeof reason === 'object' && reason.explanation && (
                    <p className="text-green-700 text-sm">{reason.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Catalysts */}
        {finalRec.catalysts && finalRec.catalysts.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              Key Catalysts
            </h3>
            <div className="space-y-4">
              {finalRec.catalysts.slice(0, 3).map((catalyst: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-lg border border-blue-200/30">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {typeof catalyst === 'object' ? catalyst.catalyst : catalyst}
                  </h4>
                  {typeof catalyst === 'object' && catalyst.impact && (
                    <p className="text-blue-700 text-sm">{catalyst.impact}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      {finalRec.risks && finalRec.risks.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            Key Risks to Consider
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {finalRec.risks.slice(0, 4).map((risk: any, index: number) => (
              <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50/30 rounded-lg border border-red-200/30">
                <h4 className="font-semibold text-red-800 mb-2">
                  {typeof risk === 'object' ? risk.risk : risk}
                </h4>
                {typeof risk === 'object' && risk.explanation && (
                  <p className="text-red-700 text-sm">{risk.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Highlights */}
      {businessData.moat_strength && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            Business Highlights
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {businessData.moat_strength && (
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50/30 rounded-lg border border-indigo-200/30">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {businessData.moat_strength}
                </div>
                <div className="text-sm font-medium text-indigo-700">Economic Moat</div>
              </div>
            )}
            {businessData.market_share && (
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg border border-blue-200/30">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {businessData.market_share.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-blue-700">Market Share</div>
              </div>
            )}
            {businessData.brand_strength && (
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/30 rounded-lg border border-green-200/30">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {businessData.brand_strength}/10
                </div>
                <div className="text-sm font-medium text-green-700">Brand Strength</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Guidance */}
      {(finalRec.portfolio_fit || finalRec.position_sizing) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            Portfolio Guidance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {finalRec.portfolio_fit && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-indigo-600" />
                  Portfolio Fit
                </h4>
                <p className="text-gray-700 leading-relaxed">{finalRec.portfolio_fit}</p>
              </div>
            )}
            
            {finalRec.position_sizing && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  Position Sizing
                </h4>
                <p className="text-gray-700 leading-relaxed">{finalRec.position_sizing}</p>
              </div>
            )}
          </div>
          
          {/* Additional Portfolio Metrics if available */}
          {finalRec.monitoring_metrics && finalRec.monitoring_metrics.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50/30 rounded-xl border border-indigo-200/30">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Key Monitoring Metrics
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {finalRec.monitoring_metrics.slice(0, 6).map((metric: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FinancialTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const financialData = analysis.analysis_data?.financial_data || {};
  const keyRatios = analysis.analysis_data?.key_ratios || {};

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}B`;
    }
    return `${num.toLocaleString()}M`;
  };

  // Helper function to get trend color
  const getTrendColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < threshold) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Financial Health Hero Section */}
      <div className="bg-gradient-to-r bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Financial Health</h1>
                <div className="flex items-center gap-4">
                  <span className="text-blue-100">
                    {financialData.revenue ? `$${formatNumber(financialData.revenue)} Revenue` : 'Financial Analysis'}
                  </span>
                  {financialData.revenue_growth_3y && (
                    <span className={`flex items-center gap-1 ${
                      financialData.revenue_growth_3y > 0 ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {getTrendIcon(financialData.revenue_growth_3y)}
                      {financialData.revenue_growth_3y.toFixed(1)}% 3Y Growth
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Key Financial Highlights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Financial Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {financialData.net_margin && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Net Margin</span>
                    <span className="font-bold text-white">{financialData.net_margin.toFixed(1)}%</span>
                  </div>
                )}
                {financialData.fcf_margin && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">FCF Margin</span>
                    <span className="font-bold text-white">{financialData.fcf_margin.toFixed(1)}%</span>
                  </div>
                )}
                {keyRatios.roe && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Return on Equity</span>
                    <span className="font-bold text-white">{keyRatios.roe.toFixed(1)}%</span>
                  </div>
                )}
                {keyRatios.debt_to_equity && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Debt/Equity</span>
                    <span className="font-bold text-white">{keyRatios.debt_to_equity.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Score Gauge (if available) */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
            <h3 className="font-semibold mb-4 text-white">Financial Strength</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              {(() => {
                // Fixed Financial Strength Calculation
                let score = 5; // Start with base score of 5
                
                // Net margin scoring (max +2 points)
                if (financialData.net_margin > 20) score += 2;
                else if (financialData.net_margin > 15) score += 1.5;
                else if (financialData.net_margin > 10) score += 1;
                else if (financialData.net_margin > 5) score += 0.5;
                
                // FCF margin scoring (max +2 points)
                if (financialData.fcf_margin > 15) score += 2;
                else if (financialData.fcf_margin > 10) score += 1.5;
                else if (financialData.fcf_margin > 5) score += 1;
                else if (financialData.fcf_margin > 0) score += 0.5;
                
                // ROE scoring (max +2 points)
                if (keyRatios.roe > 25) score += 2;
                else if (keyRatios.roe > 20) score += 1.5;
                else if (keyRatios.roe > 15) score += 1;
                else if (keyRatios.roe > 10) score += 0.5;
                
                // Debt management scoring (max +1 point)
                if (keyRatios.debt_to_equity < 0.3) score += 1;
                else if (keyRatios.debt_to_equity < 0.5) score += 0.7;
                else if (keyRatios.debt_to_equity < 1.0) score += 0.3;
                
                // Cap at exactly 10
                score = Math.min(score, 10);
                const percentage = (score / 10) * 100;
                
                return (
                  <>
                    {/* Background circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="8"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - percentage / 100)}
                        style={{
                          transition: 'stroke-dashoffset 0.5s ease-in-out'
                        }}
                      />
                    </svg>
                    {/* Score display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="text-sm text-blue-200">Out of 10.0</div>
          </div>
        </div>
      </div>
      {/* Revenue Growth Analysis */}
      {(financialData.revenue || financialData.revenue_growth_1y) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            Revenue Growth Analysis
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Revenue */}
            {financialData.revenue && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${formatNumber(financialData.revenue)}
                </div>
                <div className="text-sm font-medium text-blue-700">Annual Revenue</div>
              </div>
            )}

            {/* 1-Year Growth */}
            {financialData.revenue_growth_1y && (
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${getTrendColor(financialData.revenue_growth_1y)}`}>
                  {getTrendIcon(financialData.revenue_growth_1y)}
                  {financialData.revenue_growth_1y.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-green-700">1-Year Growth</div>
              </div>
            )}

            {/* 3-Year Growth */}
            {financialData.revenue_growth_3y && (
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
                <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${getTrendColor(financialData.revenue_growth_3y)}`}>
                  {getTrendIcon(financialData.revenue_growth_3y)}
                  {financialData.revenue_growth_3y.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-purple-700">3-Year CAGR</div>
              </div>
            )}

            {/* 5-Year Growth */}
            {financialData.revenue_growth_5y && (
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all duration-200">
                <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${getTrendColor(financialData.revenue_growth_5y)}`}>
                  {getTrendIcon(financialData.revenue_growth_5y)}
                  {financialData.revenue_growth_5y.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-indigo-700">5-Year CAGR</div>
              </div>
            )}
          </div>

          {/* Quarterly Revenue Trend */}
          {financialData.quarterly_revenue_trend && financialData.quarterly_revenue_trend.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/30">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Quarterly Revenue Trend</h3>
              <div className="grid grid-cols-4 gap-4">
                {financialData.quarterly_revenue_trend.map((revenue: number, index: number) => (
                  <div key={index} className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-lg font-bold text-gray-800">
                      ${formatNumber(revenue)}
                    </div>
                    <div className="text-xs text-gray-600">Q{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profitability Analysis */}
      {(financialData.gross_margin || financialData.operating_margin || financialData.net_margin) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <PieChart className="h-6 w-6 text-emerald-600" />
            </div>
            Profitability Analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Margin Metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Profit Margins</h3>
              
              {financialData.gross_margin && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-xl border border-emerald-200/30">
                  <span className="text-gray-700 font-medium">Gross Margin</span>
                  <span className="font-bold text-emerald-600 text-lg">{financialData.gross_margin.toFixed(1)}%</span>
                </div>
              )}

              {financialData.operating_margin && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
                  <span className="text-gray-700 font-medium">Operating Margin</span>
                  <span className="font-bold text-blue-600 text-lg">{financialData.operating_margin.toFixed(1)}%</span>
                </div>
              )}

              {financialData.net_margin && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30">
                  <span className="text-gray-700 font-medium">Net Margin</span>
                  <span className="font-bold text-purple-600 text-lg">{financialData.net_margin.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Absolute Profit Numbers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Profit Amounts</h3>
              
              {financialData.gross_profit && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-xl border border-emerald-200/30">
                  <span className="text-gray-700 font-medium">Gross Profit</span>
                  <span className="font-bold text-emerald-600 text-lg">${formatNumber(financialData.gross_profit)}</span>
                </div>
              )}

              {financialData.operating_income && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
                  <span className="text-gray-700 font-medium">Operating Income</span>
                  <span className="font-bold text-blue-600 text-lg">${formatNumber(financialData.operating_income)}</span>
                </div>
              )}

              {financialData.net_income && (
                <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30">
                  <span className="text-gray-700 font-medium">Net Income</span>
                  <span className="font-bold text-purple-600 text-lg">${formatNumber(financialData.net_income)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Analysis */}
      {(financialData.operating_cash_flow || financialData.free_cash_flow || financialData.fcf_margin) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-cyan-600" />
            </div>
            Cash Flow Analysis
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialData.operating_cash_flow && (
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-cyan-600 mb-2">
                  ${formatNumber(financialData.operating_cash_flow)}
                </div>
                <div className="text-sm font-medium text-cyan-700">Operating Cash Flow</div>
              </div>
            )}

            {financialData.free_cash_flow && (
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  ${formatNumber(financialData.free_cash_flow)}
                </div>
                <div className="text-sm font-medium text-green-700">Free Cash Flow</div>
              </div>
            )}

            {financialData.fcf_margin && (
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {financialData.fcf_margin.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-purple-700">FCF Margin</div>
              </div>
            )}

            {financialData.fcf_growth_3y && (
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all duration-200">
                <div className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${getTrendColor(financialData.fcf_growth_3y)}`}>
                  {getTrendIcon(financialData.fcf_growth_3y)}
                  {financialData.fcf_growth_3y.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-indigo-700">3Y FCF Growth</div>
              </div>
            )}
          </div>

          {financialData.capex && (
            <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-red-50/30 rounded-xl border border-orange-200/30">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Capital Expenditures</span>
                <span className="font-bold text-orange-600 text-lg">${formatNumber(financialData.capex)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Balance Sheet Strength */}
      {(financialData.total_assets || financialData.total_equity || financialData.cash_and_equivalents) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-slate-600" />
            </div>
            Balance Sheet Strength
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialData.total_assets && (
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-slate-600 mb-2">
                  ${formatNumber(financialData.total_assets)}
                </div>
                <div className="text-sm font-medium text-slate-700">Total Assets</div>
              </div>
            )}

            {financialData.total_equity && (
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  ${formatNumber(financialData.total_equity)}
                </div>
                <div className="text-sm font-medium text-green-700">Shareholders' Equity</div>
              </div>
            )}

            {financialData.total_debt && (
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  ${formatNumber(financialData.total_debt)}
                </div>
                <div className="text-sm font-medium text-red-700">Total Debt</div>
              </div>
            )}

            {financialData.cash_and_equivalents && (
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-cyan-600 mb-2">
                  ${formatNumber(financialData.cash_and_equivalents)}
                </div>
                <div className="text-sm font-medium text-cyan-700">Cash & Equivalents</div>
              </div>
            )}

            {financialData.working_capital && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${formatNumber(financialData.working_capital)}
                </div>
                <div className="text-sm font-medium text-blue-700">Working Capital</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Key Ratios */}
      {Object.keys(keyRatios).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-amber-600" />
            </div>
            Key Financial Ratios
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Profitability Ratios */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Profitability Ratios
              </h3>
              
              {keyRatios.roe && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-lg border border-green-200/30">
                  <span className="text-gray-700 font-medium">ROE</span>
                  <span className="font-bold text-green-600">{keyRatios.roe.toFixed(1)}%</span>
                </div>
              )}

              {keyRatios.roa && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-lg border border-blue-200/30">
                  <span className="text-gray-700 font-medium">ROA</span>
                  <span className="font-bold text-blue-600">{keyRatios.roa.toFixed(1)}%</span>
                </div>
              )}

              {keyRatios.roic && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-lg border border-purple-200/30">
                  <span className="text-gray-700 font-medium">ROIC</span>
                  <span className="font-bold text-purple-600">{keyRatios.roic.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Liquidity Ratios */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-blue-600" />
                Liquidity Ratios
              </h3>
              
              {keyRatios.current_ratio && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-lg border border-blue-200/30">
                  <span className="text-gray-700 font-medium">Current Ratio</span>
                  <span className="font-bold text-blue-600">{keyRatios.current_ratio.toFixed(2)}</span>
                </div>
              )}

              {keyRatios.quick_ratio && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-cyan-50 to-teal-50/30 rounded-lg border border-cyan-200/30">
                  <span className="text-gray-700 font-medium">Quick Ratio</span>
                  <span className="font-bold text-cyan-600">{keyRatios.quick_ratio.toFixed(2)}</span>
                </div>
              )}

              {keyRatios.cash_ratio && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-teal-50 to-green-50/30 rounded-lg border border-teal-200/30">
                  <span className="text-gray-700 font-medium">Cash Ratio</span>
                  <span className="font-bold text-teal-600">{keyRatios.cash_ratio.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Leverage Ratios */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                Leverage Ratios
              </h3>
              
              {keyRatios.debt_to_equity && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-red-50 to-pink-50/30 rounded-lg border border-red-200/30">
                  <span className="text-gray-700 font-medium">Debt/Equity</span>
                  <span className="font-bold text-red-600">{keyRatios.debt_to_equity.toFixed(2)}</span>
                </div>
              )}

              {keyRatios.debt_to_assets && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50/30 rounded-lg border border-orange-200/30">
                  <span className="text-gray-700 font-medium">Debt/Assets</span>
                  <span className="font-bold text-orange-600">{keyRatios.debt_to_assets.toFixed(2)}</span>
                </div>
              )}

              {keyRatios.interest_coverage && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-yellow-50 to-orange-50/30 rounded-lg border border-yellow-200/30">
                  <span className="text-gray-700 font-medium">Interest Coverage</span>
                  <span className="font-bold text-yellow-600">{keyRatios.interest_coverage.toFixed(1)}x</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shareholder Returns */}
      {(financialData.dividend_yield || financialData.share_buybacks_annual) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            Shareholder Returns
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialData.dividend_yield && (
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {financialData.dividend_yield.toFixed(2)}%
                </div>
                <div className="text-sm font-medium text-emerald-700">Dividend Yield</div>
              </div>
            )}

            {financialData.dividend_growth_rate && (
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${getTrendColor(financialData.dividend_growth_rate)}`}>
                  {getTrendIcon(financialData.dividend_growth_rate)}
                  {financialData.dividend_growth_rate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-green-700">Dividend Growth</div>
              </div>
            )}

            {financialData.share_buybacks_annual && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${formatNumber(financialData.share_buybacks_annual)}
                </div>
                <div className="text-sm font-medium text-blue-700">Annual Buybacks</div>
              </div>
            )}

            {financialData.shares_outstanding && (
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {financialData.shares_outstanding.toFixed(1)}M
                </div>
                <div className="text-sm font-medium text-purple-700">Shares Outstanding</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Industry Comparisons */}
      {(keyRatios.roe_vs_industry || keyRatios.margins_vs_industry || keyRatios.growth_vs_industry) && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl shadow-lg border border-gray-200/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            Industry Comparison
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {keyRatios.roe_vs_industry && (
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">ROE vs Industry</h4>
                <p className="text-gray-700">{keyRatios.roe_vs_industry}</p>
              </div>
            )}

            {keyRatios.margins_vs_industry && (
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Margins vs Industry</h4>
                <p className="text-gray-700">{keyRatios.margins_vs_industry}</p>
              </div>
            )}

            {keyRatios.growth_vs_industry && (
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Growth vs Industry</h4>
                <p className="text-gray-700">{keyRatios.growth_vs_industry}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Quality Assessment */}
      {(keyRatios.revenue_growth_consistency || keyRatios.earnings_growth_quality) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            Financial Quality Assessment
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {keyRatios.revenue_growth_consistency && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Growth Quality
                </h4>
                <p className="text-green-700">{keyRatios.revenue_growth_consistency}</p>
              </div>
            )}

            {keyRatios.earnings_growth_quality && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Earnings Growth Quality
                </h4>
                <p className="text-blue-700">{keyRatios.earnings_growth_quality}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BusinessTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const businessData = analysis.analysis_data?.business_analysis || {};

  // Helper function to get moat color
  const getMoatColor = (strength: string) => {
    switch (strength?.toLowerCase()) {
      case 'wide': return 'text-green-600 bg-green-50 border-green-200';
      case 'narrow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'none': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMoatIcon = (strength: string) => {
    switch (strength?.toLowerCase()) {
      case 'wide': return <Shield className="h-6 w-6 text-green-600" />;
      case 'narrow': return <Shield className="h-6 w-6 text-yellow-600" />;
      case 'none': return <Shield className="h-6 w-6 text-red-600" />;
      default: return <Shield className="h-6 w-6 text-gray-600" />;
    }
  };

  const getBusinessStrengthScore = () => {
    let score = 5; // Base score
    
    // Moat strength scoring
    if (businessData.moat_strength?.toLowerCase() === 'wide') score += 2;
    else if (businessData.moat_strength?.toLowerCase() === 'narrow') score += 1;
    
    // Market share scoring
    if (businessData.market_share > 20) score += 1.5;
    else if (businessData.market_share > 10) score += 1;
    
    // Brand strength scoring
    if (businessData.brand_strength >= 8) score += 1;
    else if (businessData.brand_strength >= 6) score += 0.5;
    
    // Competitive advantages scoring
    if (businessData.competitive_advantages?.length >= 3) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  };

  const businessScore = getBusinessStrengthScore();

  return (
    <div className="space-y-8">
      {/* Business Strength Hero Section */}
      <div className="bg-gradient-to-r bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Building className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Business Analysis</h1>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-100">
                    {businessData.moat_strength ? `${businessData.moat_strength} Economic Moat` : 'Competitive Analysis'}
                  </span>
                  {businessData.market_share && (
                    <span className="text-green-200">
                      {businessData.market_share.toFixed(1)}% Market Share
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Key Business Highlights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Competitive Position
              </h3>
              
              {/* Option 1: Grid Layout for better structure */}
              <div className="grid grid-cols-2 gap-4">
                {businessData.moat_strength && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-emerald-200 text-sm mb-1">Economic Moat</div>
                    <div className="font-bold text-white text-lg capitalize">{businessData.moat_strength}</div>
                  </div>
                )}
                
                {businessData.brand_strength && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-emerald-200 text-sm mb-1">Brand Strength</div>
                    <div className="font-bold text-white text-lg">{businessData.brand_strength}/10</div>
                  </div>
                )}
                
                {businessData.market_position && (
                  <div className="bg-white/10 rounded-lg p-3 col-span-2">
                    <div className="text-emerald-200 text-sm mb-1">Market Position</div>
                    <div className="font-bold text-white text-base leading-tight">{businessData.market_position}</div>
                  </div>
                )}
                
                {businessData.competitive_advantages?.length && (
                  <div className="bg-white/10 rounded-lg p-3 col-span-2">
                    <div className="text-emerald-200 text-sm mb-1">Competitive Advantages</div>
                    <div className="font-bold text-white text-lg">{businessData.competitive_advantages.length} Key Advantages</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Strength Gauge */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
            <h3 className="font-semibold mb-4 text-white">Business Strength</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="8"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={businessScore >= 8 ? '#10b981' : businessScore >= 6 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - businessScore / 10)}
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease-in-out'
                  }}
                />
              </svg>
              {/* Score display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{businessScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-sm text-emerald-200">Out of 10.0</div>
          </div>
        </div>
      </div>
      {/* Business Model Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
            <Building className="h-6 w-6 text-emerald-600" />
          </div>
          Business Model Overview
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Business Model Type */}
          {businessData.business_model_type && (
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-600 mb-1 capitalize">
                {businessData.business_model_type}
              </div>
              <div className="text-sm font-medium text-blue-700">Business Model</div>
            </div>
          )}

          {/* Market Share */}
          {businessData.market_share && (
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {businessData.market_share.toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-purple-700">Market Share</div>
            </div>
          )}

          {/* Market Position */}
          {businessData.market_position && (
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Crown className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-sm font-bold text-indigo-600 mb-1">
                {businessData.market_position}
              </div>
              <div className="text-sm font-medium text-indigo-700">Market Position</div>
            </div>
          )}

          {/* Brand Strength */}
          {businessData.brand_strength && (
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {businessData.brand_strength}/10
              </div>
              <div className="text-sm font-medium text-green-700">Brand Strength</div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Stream Analysis */}
      {businessData.revenue_streams && businessData.revenue_streams.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
              <PieChart className="h-6 w-6 text-cyan-600" />
            </div>
            Revenue Stream Analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Revenue Streams List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Revenue Breakdown</h3>
              {businessData.revenue_streams.map((stream: any, index: number) => {
                const colors = [
                  'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
                  'from-green-50 to-green-100/50 border-green-200/50 text-green-600', 
                  'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600',
                  'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-600',
                  'from-pink-50 to-pink-100/50 border-pink-200/50 text-pink-600'
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <div key={index} className={`p-4 bg-gradient-to-r rounded-xl border ${colorClass.split(' ').slice(0, 3).join(' ')}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold ${colorClass.split(' ')[3]}`}>
                        {stream.name || stream}
                      </h4>
                      <span className={`text-xl font-bold ${colorClass.split(' ')[3]}`}>
                        {stream.percentage}%
                      </span>
                    </div>
                    {stream.description && (
                      <p className={`text-sm ${colorClass.split(' ')[3].replace('600', '700')}`}>
                        {stream.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Visual Revenue Chart Representation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Visual Distribution</h3>
              <div className="space-y-3">
                {businessData.revenue_streams.map((stream: any, index: number) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                  const colorClass = colors[index % colors.length];
                  const percentage = stream.percentage || 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {stream.name || stream}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Exposure */}
      {businessData.geographic_exposure && Object.keys(businessData.geographic_exposure).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            Geographic Revenue Distribution
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(businessData.geographic_exposure).map(([region, percentage]: [string, any], index: number) => {
              const colors = [
                'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
                'from-green-50 to-green-100/50 border-green-200/50 text-green-600',
                'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600',
                'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-600'
              ];
              const colorClass = colors[index % colors.length];

              return (
                <div key={region} className={`text-center p-6 bg-gradient-to-br rounded-xl border hover:shadow-md transition-all duration-200 ${colorClass.split(' ').slice(0, 3).join(' ')}`}>
                  <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Map className={`h-5 w-5 ${colorClass.split(' ')[3]}`} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${colorClass.split(' ')[3]}`}>
                    {percentage}%
                  </div>
                  <div className={`text-sm font-medium ${colorClass.split(' ')[3].replace('600', '700')}`}>
                    {region}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competitive Analysis */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Economic Moat */}
        {businessData.moat_strength && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              Economic Moat
            </h2>

            <div className={`text-center p-6 bg-gradient-to-br rounded-xl border mb-6 ${getMoatColor(businessData.moat_strength)}`}>
              <div className="flex items-center justify-center mb-3">
                {getMoatIcon(businessData.moat_strength)}
              </div>
              <div className="text-2xl font-bold mb-2">
                {businessData.moat_strength} Moat
              </div>
              <div className="text-sm font-medium opacity-80">
                Competitive Protection
              </div>
            </div>

            {/* Moat Sources */}
            {businessData.moat_sources && businessData.moat_sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Moat Sources:</h4>
                {businessData.moat_sources.map((source: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-green-800 font-medium">{source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Competitive Advantages */}
        {businessData.competitive_advantages && businessData.competitive_advantages.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              Competitive Advantages
            </h2>

            <div className="space-y-4">
              {businessData.competitive_advantages.map((advantage: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/30 hover:shadow-md transition-all duration-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {typeof advantage === 'object' ? advantage.advantage : advantage}
                  </h4>
                  {typeof advantage === 'object' && advantage.explanation && (
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {advantage.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Growth Strategy */}
      {businessData.growth_drivers && businessData.growth_drivers.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            Growth Strategy & Drivers
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {businessData.growth_drivers.map((driver: any, index: number) => (
              <div key={index} className="p-6 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-xl border border-emerald-200/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-800 mb-2">
                      {typeof driver === 'object' ? driver.driver : driver}
                    </h4>
                    {typeof driver === 'object' && driver.explanation && (
                      <p className="text-emerald-700 text-sm leading-relaxed">
                        {driver.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expansion Plans */}
          {businessData.expansion_plans && businessData.expansion_plans.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Expansion Plans
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {businessData.expansion_plans.map((plan: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-blue-800 font-medium">{plan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Competitive Landscape */}
      {businessData.key_competitors && businessData.key_competitors.length > 0 && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
    <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
        <Zap className="h-6 w-6 text-red-600" />
      </div>
      Competitive Landscape
    </h2>

    {/* Company's Market Position Header */}
    {businessData.market_share && (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">
              {analysis.company?.company_name || analysis.company?.ticker || 'Company'} Market Position
            </h3>
            <p className="text-blue-700 text-sm">Market share in the total addressable market</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {businessData.market_share.toFixed(1)}%
            </div>
            <div className="text-blue-700 text-sm font-medium">Market Share</div>
          </div>
        </div>
      </div>
    )}

    {/* Competitors Grid */}
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 mb-4">Key Competitors & Market Share</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessData.key_competitors.map((competitor: any, index: number) => (
          <div 
            key={index} 
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {typeof competitor === 'object' ? competitor.name : competitor}
                </h4>
                <div className="text-gray-600 text-sm">Competitor</div>
              </div>
              
              {typeof competitor === 'object' && competitor.market_share && (
                <div className="text-right ml-3">
                  <div className="text-xl font-bold text-red-600">
                    {competitor.market_share}%
                  </div>
                  <div className="text-red-700 text-xs font-medium">Market Share</div>
                </div>
              )}
            </div>
            
            {/* Optional: Add competitive comparison if market shares are available */}
            {typeof competitor === 'object' && competitor.market_share && businessData.market_share && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">vs Company:</span>
                  <span className={`font-medium ${
                    businessData.market_share > competitor.market_share 
                      ? 'text-green-600' 
                      : businessData.market_share < competitor.market_share 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {businessData.market_share > competitor.market_share ? '↑ Leading' :
                     businessData.market_share < competitor.market_share ? '↓ Behind' : '→ Equal'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{(businessData.customer_segments || businessData.customer_loyalty || businessData.pricing_power) && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
    <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
        <Target className="h-6 w-6 text-purple-600" />
      </div>
      Customer & Market Dynamics
    </h2>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Customer Segments - Keep as is, looks good */}
      {businessData.customer_segments && businessData.customer_segments.length > 0 && (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Customer Segments
          </h4>
          <div className="space-y-2">
            {businessData.customer_segments.map((segment: string, index: number) => (
              <div key={index} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-purple-800 font-medium">{segment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Loyalty - Enhanced */}
      {businessData.customer_loyalty && (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Customer Loyalty
          </h4>
          
          {/* Enhanced loyalty display */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-xl p-4 border border-green-200/30">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-800 mb-2 leading-tight">
                {businessData.customer_loyalty}
              </div>
              <div className="text-green-700 text-sm font-medium">Loyalty Assessment</div>
            </div>
            
            {/* Optional: Add loyalty strength indicator if the text suggests it */}
            {(() => {
              const loyaltyText = businessData.customer_loyalty.toLowerCase();
              let strength = 'Medium';
              let color = 'bg-yellow-500';
              
              if (loyaltyText.includes('high') || loyaltyText.includes('strong') || loyaltyText.includes('excellent')) {
                strength = 'High';
                color = 'bg-green-500';
              } else if (loyaltyText.includes('low') || loyaltyText.includes('weak') || loyaltyText.includes('poor')) {
                strength = 'Low';
                color = 'bg-red-500';
              }
              
              return (
                <div className="mt-3 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-green-700 text-xs font-medium">{strength} Loyalty</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pricing Power - Enhanced */}
      {businessData.pricing_power && (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-indigo-600" />
            Pricing Power
          </h4>
          
          {/* Enhanced pricing power display */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 rounded-xl p-4 border border-indigo-200/30">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-indigo-800 mb-2 leading-relaxed">
                {businessData.pricing_power}
              </div>
              <div className="text-indigo-700 text-xs font-medium">Market Position</div>
            </div>
            
            {/* Optional: Add pricing power strength indicator */}
            {(() => {
              const pricingText = businessData.pricing_power.toLowerCase();
              let strength = 'Moderate';
              let color = 'bg-yellow-500';
              let icon = '→';
              
              if (pricingText.includes('strong') || pricingText.includes('high') || pricingText.includes('significant')) {
                strength = 'Strong';
                color = 'bg-green-500';
                icon = '↑';
              } else if (pricingText.includes('weak') || pricingText.includes('low') || pricingText.includes('limited')) {
                strength = 'Limited';
                color = 'bg-red-500';
                icon = '↓';
              }
              
              return (
                <div className="mt-3 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-indigo-700 text-xs font-medium">{icon} {strength} Power</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
};

const RiskTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const riskData = analysis.analysis_data?.risk_assessment || {};

  // Helper functions for risk visualization
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

  const getRiskTextColor = (score: number) => {
    if (score <= 3) return 'text-green-800';
    if (score <= 6) return 'text-amber-800';
    return 'text-red-800';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low Risk', icon: CheckCircle, color: 'text-green-600' };
    if (score <= 6) return { level: 'Medium Risk', icon: AlertCircle, color: 'text-amber-600' };
    return { level: 'High Risk', icon: XCircle, color: 'text-red-600' };
  };

  // const getRiskIcon = (category: string) => {
  //   switch (category) {
  //     case 'concentration': return Target;
  //     case 'competition': return Users;
  //     case 'disruption': return Zap;
  //     case 'regulatory': return Shield;
  //     case 'cyclical': return Activity;
  //     case 'leverage': return Scale;
  //     case 'liquidity': return TrendingDown;
  //     default: return AlertTriangle;
  //   }
  // };

  // Enhanced risk categories with detailed information
  const enhancedRiskCategories = [
    {
      key: 'concentration_risk',
      label: 'Concentration Risk',
      description: 'Customer and revenue concentration vulnerability',
      detailsKey: 'concentration_details',
      icon: Target,
      category: 'Business Risk'
    },
    {
      key: 'competition_risk', 
      label: 'Competition Risk',
      description: 'Competitive pressure and market share threats',
      detailsKey: 'competition_details',
      icon: Users,
      category: 'Business Risk'
    },
    {
      key: 'disruption_risk',
      label: 'Disruption Risk', 
      description: 'Technology and business model disruption threats',
      detailsKey: 'disruption_details',
      icon: Zap,
      category: 'Technology Risk'
    },
    {
      key: 'regulatory_risk',
      label: 'Regulatory Risk',
      description: 'Government policy and compliance challenges',
      detailsKey: 'regulatory_details', 
      icon: Shield,
      category: 'External Risk'
    },
    {
      key: 'cyclical_risk',
      label: 'Cyclical Risk',
      description: 'Economic cycle sensitivity and volatility',
      detailsKey: 'cyclical_details',
      icon: Activity,
      category: 'Economic Risk'
    },
    {
      key: 'leverage_risk',
      label: 'Leverage Risk',
      description: 'Financial leverage and debt sustainability',
      detailsKey: '',
      icon: Scale,
      category: 'Financial Risk'
    },
    {
      key: 'liquidity_risk',
      label: 'Liquidity Risk',
      description: 'Cash flow and funding availability',
      detailsKey: '',
      icon: TrendingDown,
      category: 'Financial Risk'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overall Risk Assessment Header */}
      {riskData.overall_risk_score && (
        <div className="bg-gradient-to-r bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm`}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Risk Assessment</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-100">
                      Overall Risk Level: {getRiskLevel(riskData.overall_risk_score).level}
                    </span>
                  </div>
                </div>
              </div>
              
              {riskData.risk_summary && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Risk Summary
                  </h3>
                  <p className="text-slate-50 leading-relaxed">
                    {riskData.risk_summary}
                  </p>
                </div>
              )}
            </div>

            {/* Overall Risk Score Gauge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <h3 className="font-semibold mb-4 text-white">Overall Risk Score</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Background circle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="8"
                  />
                  {/* Progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      riskData.overall_risk_score <= 3 ? '#10b981' :
                      riskData.overall_risk_score <= 6 ? '#f59e0b' : '#ef4444'
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - (riskData.overall_risk_score / 10))}
                    style={{
                      transition: 'stroke-dashoffset 0.5s ease-in-out'
                    }}
                  />
                </svg>
                {/* Score display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{riskData.overall_risk_score.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-sm text-slate-200">Out of 10.0</div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedRiskCategories.map((category) => {
          const score = riskData[category.key as keyof typeof riskData] as number;
          if (!score && score !== 0) return null;
          
          const Icon = category.icon;
          const riskLevel = getRiskLevel(score);
          const RiskIcon = riskLevel.icon;
          
          return (
            <div 
              key={category.key}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300`}
            >
              {/* Risk Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRiskBgColor(score).split('border-')[0]} ${getRiskBgColor(score).split('border-')[1]}`}>
                    <Icon className={`h-5 w-5 ${getRiskTextColor(score)}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{category.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{score}/10</div>
                  <div className={`flex items-center gap-1 text-xs ${riskLevel.color}`}>
                    <RiskIcon className="h-3 w-3" />
                    {riskLevel.level}
                  </div>
                </div>
              </div>

              {/* Risk Score Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${getRiskColor(score)} transition-all duration-1000 ease-out`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Risk Description */}
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>

              {/* Detailed Risk Analysis */}
              {category.detailsKey && riskData[category.detailsKey as keyof typeof riskData] && (
                <div className={`p-3 bg-gradient-to-r ${getRiskBgColor(score)} rounded-lg border`}>
                  <p className={`text-sm ${getRiskTextColor(score)} leading-relaxed`}>
                    {riskData[category.detailsKey as keyof typeof riskData] as string}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk Mitigation Strategies */}
      {riskData.risk_mitigation && riskData.risk_mitigation.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            Risk Mitigation Strategies
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {riskData.risk_mitigation.map((mitigation: string, index: number) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ESG and Operational Risks */}
      {(riskData.esg_risks || riskData.operational_risks) && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ESG Risks */}
          {riskData.esg_risks && riskData.esg_risks.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                ESG Risks
              </h2>

              <div className="space-y-4">
                {riskData.esg_risks.map((risk: string, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <AlertTriangle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-green-800 text-sm leading-relaxed">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Risks */}
          {riskData.operational_risks && riskData.operational_risks.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                Operational Risks
              </h2>

              <div className="space-y-4">
                {riskData.operational_risks.map((risk: string, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-orange-50 to-red-50/30 rounded-xl border border-orange-200/30">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-orange-800 text-sm leading-relaxed">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Category Breakdown Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl shadow-lg border border-gray-200/30 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
            <Target className="h-6 w-6 text-indigo-600" />
          </div>
          Risk Profile Summary
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Business Risks */}
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Business Risks
            </h4>
            <div className="space-y-2">
              {riskData.concentration_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Concentration</span>
                  <span className={`font-bold ${getRiskTextColor(riskData.concentration_risk)}`}>
                    {riskData.concentration_risk}/10
                  </span>
                </div>
              )}
              {riskData.competition_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Competition</span>
                  <span className={`font-bold ${getRiskTextColor(riskData.competition_risk)}`}>
                    {riskData.competition_risk}/10
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Technology Risks */}
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Technology Risks
            </h4>
            <div className="space-y-2">
              {riskData.disruption_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Disruption</span>
                  <span className={`font-bold ${getRiskTextColor(riskData.disruption_risk)}`}>
                    {riskData.disruption_risk}/10
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* External Risks */}
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              External Risks
            </h4>
            <div className="space-y-2">
              {riskData.regulatory_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Regulatory</span>
                  <span className={`font-bold ${getRiskTextColor(riskData.regulatory_risk)}`}>
                    {riskData.regulatory_risk}/10
                  </span>
                </div>
              )}
              {riskData.cyclical_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cyclical</span>
                  <span className={`font-bold ${getRiskTextColor(riskData.cyclical_risk)}`}>
                    {riskData.cyclical_risk}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValuationTab: React.FC<{ analysis: AnalysisResponse }> = ({ analysis }) => {
  const valuationData = analysis.analysis_data?.valuation_metrics || {};

  // Helper functions for valuation visualization
  const getValueColor = (currentPrice: number, fairValue: number) => {
    const ratio = currentPrice / fairValue;
    if (ratio < 0.85) return { color: 'text-green-600', bg: 'from-green-50 to-green-100/50 border-green-200/50', label: 'Undervalued' };
    if (ratio > 1.15) return { color: 'text-red-600', bg: 'from-red-50 to-red-100/50 border-red-200/50', label: 'Overvalued' };
    return { color: 'text-blue-600', bg: 'from-blue-50 to-blue-100/50 border-blue-200/50', label: 'Fairly Valued' };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
    return `$${value.toFixed(2)}`;
  };

  const getMultipleColor = (multiple: number, type: string) => {
    // Define reasonable ranges for different multiples
    const ranges = {
      pe: { low: 15, high: 25 },
      pfcf: { low: 15, high: 25 },
      pb: { low: 2, high: 5 },
      ps: { low: 3, high: 8 },
      ev_ebitda: { low: 10, high: 20 }
    };

    const range = ranges[type as keyof typeof ranges];
    if (!range) return 'text-gray-600';

    if (multiple < range.low) return 'text-green-600';
    if (multiple > range.high) return 'text-red-600';
    return 'text-blue-600';
  };

  const valuationConclusion = valuationData.current_price && valuationData.fair_value_estimate 
    ? getValueColor(valuationData.current_price, valuationData.fair_value_estimate)
    : null;

  return (
    <div className="space-y-8">
      {/* Valuation Summary Hero */}
      {(valuationData.current_price && valuationData.fair_value_estimate) && (
        <div className="bg-gradient-to-r bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Valuation Analysis</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-green-100">
                      {valuationConclusion?.label} • {valuationData.valuation_conclusion || 'Analysis Complete'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">${valuationData.current_price.toFixed(2)}</div>
                    <div className="text-green-100 text-sm">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">${valuationData.fair_value_estimate.toFixed(2)}</div>
                    <div className="text-green-100 text-sm">Fair Value</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${valuationData.upside_downside && valuationData.upside_downside > 0 ? 'text-green-200' : 'text-red-200'}`}>
                      {valuationData.upside_downside && valuationData.upside_downside > 0 ? '+' : ''}{valuationData.upside_downside?.toFixed(1)}%
                    </div>
                    <div className="text-green-100 text-sm">Potential Return</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Valuation Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <h3 className="font-semibold mb-4 text-white">Valuation Assessment</h3>
              
              {analysis.analysis_data?.final_recommendation?.valuation_score && (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
                      stroke={
                        analysis.analysis_data.final_recommendation.valuation_score >= 8 ? '#10b981' : 
                        analysis.analysis_data.final_recommendation.valuation_score >= 6 ? '#f59e0b' : '#ef4444'
                      }
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.analysis_data.final_recommendation.valuation_score / 10)}
                      style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {analysis.analysis_data.final_recommendation.valuation_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-slate-200 mb-2">Out of 10.0</div>
              
              {/* Show margin of safety as additional context */}
              {valuationData.margin_of_safety && (
                <div className={`text-lg font-semibold ${
                  valuationData.margin_of_safety > 0 ? 'text-green-200' : 'text-red-200'
                }`}>
                  {Math.abs(valuationData.margin_of_safety).toFixed(0)}% 
                  {valuationData.margin_of_safety > 0 ? ' Undervalued' : ' Overvalued'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Market Valuation Multiples */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          Market Valuation Multiples
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* P/E Ratio */}
          {valuationData.pe_ratio && (
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getMultipleColor(valuationData.pe_ratio, 'pe')}`}>
                {valuationData.pe_ratio.toFixed(1)}x
              </div>
              <div className="text-sm font-medium text-blue-700">P/E Ratio</div>
              {valuationData.forward_pe && (
                <div className="text-xs text-blue-600 mt-1">Fwd: {valuationData.forward_pe.toFixed(1)}x</div>
              )}
            </div>
          )}

          {/* P/FCF Ratio */}
          {valuationData.pfcf_ratio && (
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getMultipleColor(valuationData.pfcf_ratio, 'pfcf')}`}>
                {valuationData.pfcf_ratio.toFixed(1)}x
              </div>
              <div className="text-sm font-medium text-green-700">P/FCF Ratio</div>
            </div>
          )}

          {/* P/B Ratio */}
          {valuationData.pb_ratio && (
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getMultipleColor(valuationData.pb_ratio, 'pb')}`}>
                {valuationData.pb_ratio.toFixed(1)}x
              </div>
              <div className="text-sm font-medium text-purple-700">P/B Ratio</div>
            </div>
          )}

          {/* P/S Ratio */}
          {valuationData.ps_ratio && (
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <PieChart className="h-5 w-5 text-orange-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getMultipleColor(valuationData.ps_ratio, 'ps')}`}>
                {valuationData.ps_ratio.toFixed(1)}x
              </div>
              <div className="text-sm font-medium text-orange-700">P/S Ratio</div>
            </div>
          )}
        </div>

        {/* Enterprise Value Multiples */}
        {(valuationData.ev_revenue || valuationData.ev_ebitda) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enterprise Value Multiples</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {valuationData.ev_revenue && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-teal-50 to-cyan-50/30 rounded-lg border border-teal-200/30">
                  <span className="text-gray-700 font-medium">EV/Revenue</span>
                  <span className={`font-bold text-lg ${getMultipleColor(valuationData.ev_revenue, 'ps')}`}>
                    {valuationData.ev_revenue.toFixed(1)}x
                  </span>
                </div>
              )}
              {valuationData.ev_ebitda && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-lg border border-indigo-200/30">
                  <span className="text-gray-700 font-medium">EV/EBITDA</span>
                  <span className={`font-bold text-lg ${getMultipleColor(valuationData.ev_ebitda, 'ev_ebitda')}`}>
                    {valuationData.ev_ebitda.toFixed(1)}x
                  </span>
                </div>
              )}
              {valuationData.peg_ratio && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-pink-50 to-rose-50/30 rounded-lg border border-pink-200/30">
                  <span className="text-gray-700 font-medium">PEG Ratio</span>
                  <span className={`font-bold text-lg ${valuationData.peg_ratio < 1 ? 'text-green-600' : valuationData.peg_ratio > 2 ? 'text-red-600' : 'text-blue-600'}`}>
                    {valuationData.peg_ratio.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DCF Intrinsic Valuation */}
      {(valuationData.dcf_fair_value || valuationData.dcf_assumptions) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            DCF Intrinsic Valuation
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* DCF Results */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Valuation Results</h3>
              
              {valuationData.dcf_fair_value && (
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-xl border border-emerald-200/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      ${valuationData.dcf_fair_value.toFixed(2)}
                    </div>
                    <div className="text-emerald-700 font-medium">DCF Fair Value</div>
                  </div>
                  {valuationData.current_price && (
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700">vs Current Price</span>
                        <span className={`font-bold ${
                          valuationData.dcf_fair_value > valuationData.current_price ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(((valuationData.dcf_fair_value - valuationData.current_price) / valuationData.current_price) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {valuationData.margin_of_safety && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Margin of Safety</span>
                    <span className={`font-bold text-lg ${
                      valuationData.margin_of_safety > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {valuationData.margin_of_safety.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* DCF Assumptions */}
            {valuationData.dcf_assumptions && Object.keys(valuationData.dcf_assumptions).length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Key Assumptions</h3>
                <div className="space-y-3">
                  {Object.entries(valuationData.dcf_assumptions).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-gray-800">
                        {typeof value === 'number' ? 
                          (key.includes('rate') || key.includes('growth') ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)) 
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relative Valuation & Peer Comparison */}
      {(valuationData.pe_vs_industry || valuationData.ev_sales_vs_peers || valuationData.premium_discount) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            Peer Comparison Analysis
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valuationData.pe_vs_industry && (
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-200/30">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  P/E vs Industry
                </h4>
                <p className="text-purple-700 text-sm">{valuationData.pe_vs_industry}</p>
              </div>
            )}

            {valuationData.ev_sales_vs_peers && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-200/30">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  EV/Sales vs Peers
                </h4>
                <p className="text-blue-700 text-sm">{valuationData.ev_sales_vs_peers}</p>
              </div>
            )}

            {valuationData.premium_discount && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200/30">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Premium/Discount
                </h4>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    valuationData.premium_discount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {valuationData.premium_discount > 0 ? '+' : ''}{valuationData.premium_discount.toFixed(1)}%
                  </div>
                  <div className="text-green-700 text-sm">vs Peers</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sensitivity Analysis */}
      {valuationData.sensitivity_analysis && Object.keys(valuationData.sensitivity_analysis).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            Sensitivity Analysis
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(valuationData.sensitivity_analysis).map(([key, value]: [string, any]) => (
              <div key={key} className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50/30 rounded-xl border border-amber-200/30">
                <h4 className="font-semibold text-amber-800 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <div className="text-amber-700 font-bold text-lg">
                  {typeof value === 'number' ? 
                    (key.includes('rate') || key.includes('growth') ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)) 
                    : value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-amber-50/30 rounded-xl border border-gray-200/30">
            <p className="text-gray-700 text-sm">
              <strong>Sensitivity Analysis:</strong> Shows how valuation changes with different assumptions. 
              Higher sensitivity indicates greater uncertainty in fair value estimates.
            </p>
          </div>
        </div>
      )}

      {/* Valuation Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl shadow-lg border border-gray-200/30 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
            <Award className="h-6 w-6 text-indigo-600" />
          </div>
          Valuation Summary
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Current Valuation */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
            <h4 className="font-semibold text-gray-800 mb-4">Current Valuation</h4>
            {valuationData.current_price && (
              <div className="text-2xl font-bold text-blue-600 mb-2">
                ${valuationData.current_price.toFixed(2)}
              </div>
            )}
            {valuationData.market_cap && (
              <div className="text-gray-600">
                Market Cap: {formatCurrency(valuationData.market_cap)}
              </div>
            )}
          </div>

          {/* Fair Value Range */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
            <h4 className="font-semibold text-gray-800 mb-4">Fair Value</h4>
            {valuationData.fair_value_estimate && (
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${valuationData.fair_value_estimate.toFixed(2)}
              </div>
            )}
            {valuationData.valuation_conclusion && (
              <div className="text-gray-600">
                {valuationData.valuation_conclusion}
              </div>
            )}
          </div>

          {/* Investment Potential */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
            <h4 className="font-semibold text-gray-800 mb-4">Investment Potential</h4>
            {valuationData.upside_downside && (
              <div className={`text-2xl font-bold mb-2 ${
                valuationData.upside_downside > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {valuationData.upside_downside > 0 ? '+' : ''}{valuationData.upside_downside.toFixed(1)}%
              </div>
            )}
            <div className="text-gray-600">
              {valuationData.upside_downside && valuationData.upside_downside > 0 ? 'Upside' : 'Downside'} Potential
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagementAnalysis: React.FC<{ 
  analysis: AnalysisResponse; 
  companyImages: CompanyImages | null;
}> = ({ analysis }) => {
  const managementData = analysis.analysis_data?.management_analysis || {};
  
  // Calculate overall management score
  const getOverallManagementScore = () => {
    const scores = [];
    if (managementData.management_quality) scores.push(managementData.management_quality);
    if (managementData.corporate_governance) scores.push(managementData.corporate_governance);
    if (managementData.communication_quality) scores.push(managementData.communication_quality);
    if (managementData.transparency_score) scores.push(managementData.transparency_score);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const overallScore = getOverallManagementScore();
  
  // Helper functions for consistent styling
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 4) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const getTenureLabel = (tenure: number) => {
    if (tenure >= 10) return 'Veteran Leader';
    if (tenure >= 5) return 'Experienced';
    if (tenure >= 2) return 'Developing';
    return 'New Leadership';
  };

  return (
    <div className="space-y-8">
      {/* Management Excellence Hero Section */}
      <div className="bg-gradient-to-r bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl shadow-2xl p-8 text-white">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Management Analysis</h1>
                <div className="flex items-center gap-4">
                  <span className="text-indigo-100">
                    {managementData.ceo_name || 'Leadership Team Assessment'}
                  </span>
                  {managementData.ceo_tenure && (
                    <span className="text-purple-200">
                      {managementData.ceo_tenure} {managementData.ceo_tenure === 1 ? 'Year' : 'Years'} Tenure
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Management Highlights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Leadership Scorecard
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {managementData.management_quality && (
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Management Quality</span>
                    <span className="font-bold text-white">{managementData.management_quality}/10</span>
                  </div>
                )}
                {managementData.corporate_governance && (
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Corporate Governance</span>
                    <span className="font-bold text-white">{managementData.corporate_governance}/10</span>
                  </div>
                )}
                {managementData.communication_quality && (
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Communication</span>
                    <span className="font-bold text-white">{managementData.communication_quality}/10</span>
                  </div>
                )}
                {managementData.transparency_score && (
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Transparency</span>
                    <span className="font-bold text-white">{managementData.transparency_score}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overall Management Score Gauge */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
            <h3 className="font-semibold mb-4 text-white">Management Excellence</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="8"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={overallScore >= 8 ? '#10b981' : overallScore >= 6 ? '#3b82f6' : overallScore >= 4 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - overallScore / 10)}
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease-in-out'
                  }}
                />
              </svg>
              {/* Score display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{overallScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-sm text-indigo-200">Out of 10.0</div>
          </div>
        </div>
      </div>

      {/* CEO & Leadership Team - Consistent Styling */}
      {(managementData.ceo_name || managementData.ceo_tenure || managementData.ceo_background) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            Chief Executive Officer
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* CEO Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* CEO Basic Info */}
              <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50/30 rounded-xl border border-indigo-200/30">
                
                <div className="flex-1">
                  {managementData.ceo_name && (
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{managementData.ceo_name}</h3>
                  )}
                  
                  {managementData.ceo_tenure && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-600">Tenure:</span>
                      <span className="font-semibold text-gray-900">
                        {managementData.ceo_tenure} {managementData.ceo_tenure === 1 ? 'Year' : 'Years'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        managementData.ceo_tenure >= 10 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        managementData.ceo_tenure >= 5 ? 'bg-green-100 text-green-800 border-green-200' :
                        managementData.ceo_tenure >= 2 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                      }`}>
                        {getTenureLabel(managementData.ceo_tenure)}
                      </span>
                    </div>
                  )}

                  {managementData.ceo_background && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Professional Background</h4>
                      <p className="text-gray-700 leading-relaxed">{managementData.ceo_background}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Track Record */}
              {managementData.track_record && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Performance Track Record
                  </h4>
                  <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {managementData.track_record}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Management Scores Summary */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Leadership Scores</h4>
              
              {managementData.management_quality && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Management Quality</span>
                    <span className={`text-xl font-bold ${getScoreColor(managementData.management_quality)}`}>
                      {managementData.management_quality}/10
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(managementData.management_quality)}`}>
                    {getScoreLabel(managementData.management_quality)}
                  </span>
                </div>
              )}

              {managementData.corporate_governance && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Corporate Governance</span>
                    <span className={`text-xl font-bold ${getScoreColor(managementData.corporate_governance)}`}>
                      {managementData.corporate_governance}/10
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(managementData.corporate_governance)}`}>
                    {getScoreLabel(managementData.corporate_governance)}
                  </span>
                </div>
              )}

              {managementData.communication_quality && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Communication</span>
                    <span className={`text-xl font-bold ${getScoreColor(managementData.communication_quality)}`}>
                      {managementData.communication_quality}/10
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(managementData.communication_quality)}`}>
                    {getScoreLabel(managementData.communication_quality)}
                  </span>
                </div>
              )}

              {managementData.transparency_score && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Transparency</span>
                    <span className={`text-xl font-bold ${getScoreColor(managementData.transparency_score)}`}>
                      {managementData.transparency_score}/10
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(managementData.transparency_score)}`}>
                    {getScoreLabel(managementData.transparency_score)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leadership Team & Strategic Decisions - Consistent Styling */}
      {(managementData.leadership_team?.length || managementData.strategic_decisions?.length) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            Leadership Team & Strategic Execution
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Leadership Team */}
            {managementData.leadership_team?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Key Executives</h3>
                <div className="space-y-3">
                  {managementData.leadership_team.map((exec: any, index: number) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="font-semibold text-gray-900">{exec.name || exec}</div>
                      {exec.role && <div className="text-gray-600 text-sm">{exec.role}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Decisions */}
            {managementData.strategic_decisions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Key Strategic Decisions</h3>
                <div className="space-y-3">
                  {managementData.strategic_decisions.map((decision: any, index: number) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="font-semibold text-gray-900 mb-1">
                        {typeof decision === 'object' ? decision.decision : decision}
                      </div>
                      {typeof decision === 'object' && decision.outcome && (
                        <div className="text-gray-600 text-sm">{decision.outcome}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Governance & Compensation - Consistent Styling */}
      {(managementData.board_independence || managementData.executive_compensation || managementData.shareholder_friendliness) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            Corporate Governance
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementData.board_independence && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-green-600" />
                  Board Independence
                </h4>
                <p className="text-gray-700">{managementData.board_independence}</p>
              </div>
            )}

            {managementData.executive_compensation && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Executive Compensation
                </h4>
                <p className="text-gray-700">{managementData.executive_compensation}</p>
              </div>
            )}

            {managementData.shareholder_friendliness && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Shareholder Relations
                </h4>
                <p className="text-gray-700">{managementData.shareholder_friendliness}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};