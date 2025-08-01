import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onOpenWatchlist: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenWatchlist }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <img src="/lego.svg" alt="Fundamentals" className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-gray-900">fundamentals</span>
          </button>

          {/* Watchlist Button */}
          <button
            onClick={onOpenWatchlist}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Star className="h-5 w-5" />
            <span className="hidden sm:inline">Watchlist</span>
          </button>
        </div>
      </div>
    </div>
  );
};