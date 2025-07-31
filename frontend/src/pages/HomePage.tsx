import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { LoadingAnalysis } from '../components/LoadingAnalysis';
import { analysisApi } from '../lib/api';
import { TrendingUp, Brain, BarChart3, Shield, Target } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Sidebar } from '../components/Sidebar';

export const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = async (ticker: string) => {
    setIsLoading(true);
    setCurrentTicker(ticker);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 2000);

    try {
      await analysisApi.startAnalysis(ticker);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Wait a moment to show completion, then redirect to results
      setTimeout(() => {
        window.location.href = `/analysis/${ticker}`;
      }, 1000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      clearInterval(progressInterval);
      setIsLoading(false);
      alert('Analysis failed. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingAnalysis ticker={currentTicker} progress={progress} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <TopBar onOpenWatchlist={() => setIsSidebarOpen(true)} />
      <div className="w-full px-4 py-20">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Financial Analysis</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get comprehensive fundamental analysis powered by specialized AI agents. 
            Analyze financials, assess risks, evaluate management, and receive actionable investment recommendations.
          </p>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Health</h3>
            <p className="text-gray-600 text-sm">Deep dive into income statements, balance sheets, and key financial ratios.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Analysis</h3>
            <p className="text-gray-600 text-sm">Understand competitive advantages, market position, and growth drivers.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">Evaluate concentration, competition, disruption, and regulatory risks.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Valuation</h3>
            <p className="text-gray-600 text-sm">Get fair value estimates and actionable BUY/SELL/HOLD recommendations.</p>
          </div>
        </div>

        {/* Recent Analysis Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Powered by Specialized AI Agents</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
            {[
              'Financial Agent', 
              'Business Agent', 
              'Risk Agent', 
              'Valuation Agent',
              'Management Agent',
              'Industry Agent', 
              'Decision Agent',
              'Knowledge Agent'
            ].map((agent, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700">{agent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};