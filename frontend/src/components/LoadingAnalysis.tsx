import React from 'react';
import { Brain, BarChart3, TrendingUp, Shield, DollarSign, Users, Building, CheckCircle } from 'lucide-react';

interface LoadingAnalysisProps {
  ticker: string;
  progress?: number;
}

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ ticker, progress = 0 }) => {
  const steps = [
    { icon: Brain, label: 'Checking knowledge', completed: progress > 10 },
    { icon: BarChart3, label: 'Gathering financial data', completed: progress > 25 },
    { icon: TrendingUp, label: 'Calculating ratios', completed: progress > 40 },
    { icon: Building, label: 'Analyzing business', completed: progress > 55 },
    { icon: Shield, label: 'Assessing risks', completed: progress > 70 },
    { icon: DollarSign, label: 'Valuation metrics', completed: progress > 85 },
    { icon: Users, label: 'Management analysis', completed: progress > 90 },
    { icon: CheckCircle, label: 'Final recommendation', completed: progress > 95 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing {ticker}
          </h2>
          <p className="text-gray-600">
            Our AI agents are conducting comprehensive analysis...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Analysis steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  step.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm font-medium ${
                  step.completed ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
                {step.completed && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  );
};