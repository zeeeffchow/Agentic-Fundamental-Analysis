import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, TrendingUp, X, Home } from 'lucide-react';
import { watchlistApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface WatchlistItem {
  id: number;
  company: {
    id: number;
    ticker: string;
    company_name?: string;
  };
  analysis: {
    id: number;
    recommendation: string;
    confidence_score: number;
    analysis_date: string;
  };
  added_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchWatchlist();
    }
  }, [isOpen]);

  const fetchWatchlist = async () => {
    try {
      const data = await watchlistApi.get();
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (companyId: number) => {
    try {
        await watchlistApi.remove(companyId);
        setWatchlist(prev => prev.filter(item => item.company.id !== companyId));
    } catch (error) {
        console.error('Failed to remove from watchlist:', error);
    }
  };

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toUpperCase()) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const goToAnalysis = (ticker: string) => {
    navigate(`/analysis/${ticker}`);
    onClose();
  };

  const goHome = () => {
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Watchlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={goHome}
            className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Back to Search</span>
          </button>
        </div>

        {/* Watchlist Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No companies in watchlist</p>
              <p className="text-sm text-gray-400">
                Add companies from analysis results
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg">
                  {/* Company Header */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => goToAnalysis(item.company.ticker)}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">{item.company.ticker}</span>
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(item.company.id)}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(item.analysis.recommendation)}`}>
                        {item.analysis.recommendation}
                      </span>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedItems.has(item.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {item.company.company_name && (
                          <p className="text-sm text-gray-600">{item.company.company_name}</p>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Confidence:</span>
                          <span className="font-medium">
                            {(item.analysis.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Added:</span>
                          <span className="text-gray-600">
                            {new Date(item.added_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => goToAnalysis(item.company.ticker)}
                          className="w-full mt-2 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Analysis
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {watchlist.length} {watchlist.length === 1 ? 'company' : 'companies'} in watchlist
          </p>
        </div>
      </div>
    </>
  );
};