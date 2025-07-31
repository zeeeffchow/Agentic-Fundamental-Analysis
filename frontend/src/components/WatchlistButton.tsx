import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { watchlistApi } from '../lib/api';

interface WatchlistButtonProps {
  companyId: number;
  analysisId: number;
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({ 
  companyId, 
  analysisId, 
  className = "" 
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToWatchlist = async () => {
    setIsLoading(true);
    try {
        await watchlistApi.add(companyId, analysisId);
        setIsAdded(true);
        
        // Reset after 2 seconds to show feedback
        setTimeout(() => {
        setIsAdded(false);
        }, 2000);
    } catch (error) {
        console.error('Failed to add to watchlist:', error);
        alert('Failed to add to watchlist. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToWatchlist}
      disabled={isLoading || isAdded}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isAdded 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4" />
          Added to Watchlist!
        </>
      ) : (
        <>
          <Star className="h-4 w-4" />
          Add to Watchlist
        </>
      )}
    </button>
  );
};