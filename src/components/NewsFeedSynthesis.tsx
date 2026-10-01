import React, { useState, useEffect } from 'react';
import { 
  Rss, 
  Sparkles, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  Layers, 
  RotateCcw, 
  Filter, 
  Plus, 
  Check, 
  Copy, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { NewsArticle, CrossFeedSynthesisResult } from '../types/nlp';

interface NewsFeedSynthesisProps {
  onSendToSummarizer: (text: string) => void;
}

export function NewsFeedSynthesis({ onSendToSummarizer }: NewsFeedSynthesisProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<CrossFeedSynthesisResult | null>(null);
  const [inspectArticle, setInspectArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Custom Article Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [customCategory, setCustomCategory] = useState('Technology & AI');
  const [customContent, setCustomContent] = useState('');

  // Fetch initial feeds
  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp/news-feeds');
      const data = await res.json();
      if (data.feeds) {
        setArticles(data.feeds);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load news feeds.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Technology & AI', 'Energy & Climate', 'Markets & Finance', 'Biotech & Health'];

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(a.category.toLowerCase()));

  const toggleSelectArticle = (id: string) => {
    setSelectedArticleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchSynthesize = async () => {
    if (selectedArticleIds.length < 2) {
      setError('Please select at least 2 articles to run cross-feed synthesis.');
      return;
    }

    setSynthesizing(true);
    setError(null);

    const chosenArticles = articles.filter(a => selectedArticleIds.includes(a.id));

    try {
      const response = await fetch('/api/nlp/batch-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: chosenArticles }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to synthesize feed articles.');
      }

      const data: CrossFeedSynthesisResult = await response.json();
      setSynthesisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during cross-feed synthesis.');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleAddCustomArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customContent.trim()) return;

    const newArt: NewsArticle = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      source: customSource.trim() || 'Custom Feed Entry',
      author: 'Feed Contributor',
      category: customCategory,
      publishedAt: 'Just now',
      readTime: `${Math.max(1, Math.round(customContent.split(/\s+/).length / 200))} min read`,
      tags: ['Custom Feed', 'Live NLP'],
      initialSentiment: { score: 0.35, label: 'Positive' },
      summaryPreview: customContent.slice(0, 140) + '...',
      content: customContent,
    };

    setArticles([newArt, ...articles]);
    setShowAddModal(false);
    setCustomTitle('');
    setCustomSource('');
    setCustomContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Rss className="w-5 h-5 text-blue-600" />
            News Feeds & Cross-Source Synthesis
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time news streams, view instantaneous sentiment evaluations, and synthesize multiple reports into unified executive briefings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Feed Story</span>
          </button>

          <button
            onClick={handleBatchSynthesize}
            disabled={selectedArticleIds.length < 2 || synthesizing}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedArticleIds.length >= 2
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {synthesizing ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing ({selectedArticleIds.length})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Selected ({selectedArticleIds.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Synthesis Result Banner (when active) */}
      {synthesisResult && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Multi-Feed Executive Intelligence Briefing
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-0.5 text-white">
                {synthesisResult.briefingTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-medium text-indigo-200 border border-white/10">
                {selectedArticleIds.length} Sources Synthesized
              </span>
              <button
                onClick={() => setSynthesisResult(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Narrative */}
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5">
            {synthesisResult.synthesisNarrative}
          </div>

          {/* Consensus vs Divergence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Cross-Source Consensus Points
              </h4>
              <ul className="text-xs text-emerald-100/90 space-y-1.5 list-disc pl-4">
                {synthesisResult.consensusPoints?.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Key Disagreements & Divergences
              </h4>
              <ul className="text-xs text-amber-100/90 space-y-1.5 list-disc pl-4">
                {synthesisResult.divergencePoints?.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Aggregate Sentiment & Outlook */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Consensus Sentiment:</span>
              <span className="font-bold text-emerald-400">
                {synthesisResult.aggregateSentiment.label} ({synthesisResult.aggregateSentiment.score > 0 ? `+${synthesisResult.aggregateSentiment.score}` : synthesisResult.aggregateSentiment.score})
              </span>
              <span className="text-slate-400 italic hidden sm:inline">— {synthesisResult.aggregateSentiment.explanation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto hidden sm:block">
          Select 2+ articles to generate a unified cross-source synthesis
        </span>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.map((article) => {
          const isSelected = selectedArticleIds.includes(article.id);
          const score = article.initialSentiment.score;
          const isPositive = score >= 0.2;
          const isNegative = score <= -0.2;

          return (
            <div
              key={article.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="p-5 space-y-3">
                {/* Card Top Metadata & Checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {article.publishedAt}
                    </span>
                  </div>

                  {/* Multi-select toggle */}
                  <button
                    onClick={() => toggleSelectArticle(article.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 cursor-pointer"
                    title={isSelected ? 'Deselect for synthesis' : 'Select for multi-source synthesis'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Article Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600">
                  {article.title}
                </h3>

                {/* Source & Read Time */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Source: <strong className="text-slate-700">{article.source}</strong></span>
                  <span>{article.readTime}</span>
                </div>

                {/* Summary / Preview */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {article.summaryPreview}
                </p>

                {/* Tags & Sentiment Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isNegative
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {score > 0 ? `+${score}` : score} {article.initialSentiment.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setInspectArticle(article)}
                  className="px-3 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Quick Read
                </button>

                <button
                  onClick={() => onSendToSummarizer(article.content)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Deep NLP Summarize</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Full Article Modal */}
      {inspectArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {inspectArticle.category} • {inspectArticle.source}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {inspectArticle.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  By {inspectArticle.author} • {inspectArticle.publishedAt}
                </p>
              </div>
              <button
                onClick={() => setInspectArticle(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
              {inspectArticle.content.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Sentiment: <strong>{inspectArticle.initialSentiment.label}</strong> ({inspectArticle.initialSentiment.score})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectArticle(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSendToSummarizer(inspectArticle.content);
                    setInspectArticle(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Send to NLP Summarizer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Feed Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomArticle} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Custom Story to Feed</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Article Headline</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="E.g. Autonomous Satellite Constellation Achieves Zero-Interference Mesh"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source / Publication</label>
                <input
                  type="text"
                  value={customSource}
                  onChange={e => setCustomSource(e.target.value)}
                  placeholder="E.g. Orbital Herald"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Technology & AI">Technology & AI</option>
                  <option value="Energy & Climate">Energy & Climate</option>
                  <option value="Markets & Finance">Markets & Finance</option>
                  <option value="Biotech & Health">Biotech & Health</option>
                  <option value="General News">General News</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Article Full Text / Report</label>
              <textarea
                rows={5}
                required
                value={customContent}
                onChange={e => setCustomContent(e.target.value)}
                placeholder="Paste the news story text here..."
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Add Story
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
