/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ArticleSummarizer } from './components/ArticleSummarizer';
import { NewsFeedSynthesis } from './components/NewsFeedSynthesis';
import { SentimentDashboard } from './components/SentimentDashboard';
import { SentimentPlayground } from './components/SentimentPlayground';
import { Sparkles, Brain, Cpu, Github, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('articles');
  const [initialArticleText, setInitialArticleText] = useState<string | null>(null);

  const handleSendToSummarizer = (text: string) => {
    setInitialArticleText(text);
    setActiveTab('articles');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'articles' && (
          <ArticleSummarizer initialText={initialArticleText} />
        )}

        {activeTab === 'news' && (
          <NewsFeedSynthesis onSendToSummarizer={handleSendToSummarizer} />
        )}

        {activeTab === 'trending' && (
          <SentimentDashboard />
        )}

        {activeTab === 'playground' && (
          <SentimentPlayground />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LexiPulse NLP Studio</span>
            <span>•</span>
            <span>Computational Linguistics & Sentiment Tracking</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Engine: gemini-3.8-flash
            </span>
            <span>•</span>
            <span>Aspect-Based Sentiment Analysis (ABSA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
