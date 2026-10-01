import React from 'react';
import { 
  FileText, 
  Rss, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Cpu
} from 'lucide-react';

export type ActiveTab = 'articles' | 'news' | 'trending' | 'playground';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    {
      id: 'articles' as ActiveTab,
      label: 'Long Article Summarizer',
      icon: FileText,
      badge: 'Multi-Style NLP',
    },
    {
      id: 'news' as ActiveTab,
      label: 'News Feeds & Synthesis',
      icon: Rss,
      badge: 'Cross-Source',
    },
    {
      id: 'trending' as ActiveTab,
      label: 'Trending Topics Sentiment',
      icon: TrendingUp,
      badge: 'Live Dashboard',
    },
    {
      id: 'playground' as ActiveTab,
      label: 'Sentiment Playground',
      icon: Activity,
      badge: 'ABSA & Emotions',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  LexiPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  NLP Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Deep text summarization, multi-feed synthesis & sentiment intelligence
              </p>
            </div>
          </div>

          {/* Model Status Pill */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500">Engine:</span>
              <span className="font-semibold text-slate-900 font-mono">gemini-3.8-flash</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Model Ready" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`hidden lg:inline-block text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
