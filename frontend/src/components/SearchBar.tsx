import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading = false,
  className 
}) => {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter company ticker (e.g., AAPL, MSFT, GOOGL)"
            className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Popular stocks suggestions */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm mb-3">Popular stocks:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'].map((symbol) => (
            <button
              key={symbol}
              onClick={() => setTicker(symbol)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
              disabled={isLoading}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};