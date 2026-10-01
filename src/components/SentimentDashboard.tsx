import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  RotateCcw, 
  Sparkles, 
  BarChart2, 
  MessageSquare, 
  Layers, 
  Activity, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Scale
} from 'lucide-react';
import { TrendingTopic, AspectSentiment } from '../types/nlp';
import { SentimentGauge, TimelineChart, SentimentDistributionBar } from './SvgCharts';

export function SentimentDashboard() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analyzingQuery, setAnalyzingQuery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareTopicId, setCompareTopicId] = useState<string>('');

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp/trending-topics');
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        setTopics(data.topics);
        setSelectedTopicId(data.topics[0].id);
        if (data.topics.length > 1) {
          setCompareTopicId(data.topics[1].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch trending topics.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCustomTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setAnalyzingQuery(true);
    setError(null);

    try {
      const res = await fetch('/api/nlp/analyze-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicQuery: searchQuery.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze topic.');
      }

      const newTopic: TrendingTopic = await res.json();
      // Add or replace in list
      setTopics(prev => {
        const filtered = prev.filter(t => t.id !== newTopic.id);
        return [newTopic, ...filtered];
      });
      setSelectedTopicId(newTopic.id);
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error evaluating topic sentiment.');
    } finally {
      setAnalyzingQuery(false);
    }
  };

  const currentTopic = topics.find(t => t.id === selectedTopicId) || topics[0];
  const compareTopic = topics.find(t => t.id === compareTopicId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Trending Topics Sentiment Intelligence Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time sentiment trajectory, volume velocity, emotion distribution, and aspect-based sentiment across trending public discourse.
          </p>
        </div>

        {/* Custom Topic Search & Analysis Bar */}
        <form onSubmit={handleAnalyzeCustomTopic} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Analyze any topic (e.g. Fusion, Starship)..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={analyzingQuery || !searchQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {analyzingQuery ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{analyzingQuery ? 'Analyzing...' : 'Track Topic'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Trending Topics Horizontal Cards Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Active Monitored Topics</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                compareMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{compareMode ? 'Exit Comparison' : 'Compare 2 Topics'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topics.map((t) => {
            const isSelected = selectedTopicId === t.id;
            const isComparing = compareMode && compareTopicId === t.id;
            const isPos = t.sentimentScore >= 20;
            const isNeg = t.sentimentScore <= -10;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (compareMode && selectedTopicId && selectedTopicId !== t.id) {
                    setCompareTopicId(t.id);
                  } else {
                    setSelectedTopicId(t.id);
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : isComparing
                    ? 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-600 truncate">{t.category}</span>
                    <span className={`font-mono font-bold ${t.change24h.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.change24h}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {t.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">{t.volume}</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                        isPos
                          ? 'bg-emerald-100 text-emerald-800'
                          : isNeg
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.sentimentScore > 0 ? `+${t.sentimentScore}` : t.sentimentScore}
                    </span>
                  </div>

                  <div className="mt-2">
                    <SentimentDistributionBar
                      positive={t.distribution.positive}
                      neutral={t.distribution.neutral}
                      negative={t.distribution.negative}
                      showLabels={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Inspector: Single Topic or Compare Mode */}
      {currentTopic && !compareMode && (
        <div className="space-y-6">
          {/* Topic Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                    {currentTopic.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: #{currentTopic.id}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Velocity: {currentTopic.velocity}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5">
                  {currentTopic.name}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Buzz Volume</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {currentTopic.volume}
                  </span>
                </div>
                <div className="text-right border-l border-slate-200 pl-4">
                  <span className="text-xs text-slate-400 block">24h Growth</span>
                  <span className={`text-base font-extrabold font-mono flex items-center justify-end ${currentTopic.change24h.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currentTopic.change24h.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {currentTopic.change24h}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Analytics Row: Gauge + 24h Timeline + Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Sentiment Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                <SentimentGauge
                  score={currentTopic.sentimentScore}
                  label="Net Sentiment Index"
                  size={190}
                />
                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-slate-800">
                    Rating: {currentTopic.sentimentLabel}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aggregated across digital publications and social discourse
                  </p>
                </div>
              </div>

              {/* Middle: 24h Sentiment Timeline Curve */}
              <div className="md:col-span-5 p-4 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    24-Hour Sentiment Trajectory
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Normalized -100 to +100</span>
                </div>

                <TimelineChart points={currentTopic.timeline} height={150} />

                <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">
                  Hover points to inspect hourly sentiment and volume surges
                </div>
              </div>

              {/* Right: Positive / Neutral / Negative Distribution */}
              <div className="md:col-span-3 p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sentiment Polarity Split
                </h4>

                <SentimentDistributionBar
                  positive={currentTopic.distribution.positive}
                  neutral={currentTopic.distribution.neutral}
                  negative={currentTopic.distribution.negative}
                  showLabels={true}
                />

                <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Bullish / Positive:</span>
                    <span className="font-bold text-emerald-600 font-mono">{currentTopic.distribution.positive}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Neutral Observation:</span>
                    <span className="font-bold text-amber-600 font-mono">{currentTopic.distribution.neutral}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Bearish / Criticism:</span>
                    <span className="font-bold text-rose-600 font-mono">{currentTopic.distribution.negative}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aspect-Based Sentiment Analysis (ABSA) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Aspect-Based Sentiment Breakdown (ABSA)
                </h4>
                <span className="text-[10px] text-slate-400">Entity & dimension-level sentiment decomposition</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentTopic.aspects.map((asp, idx) => {
                  const isPos = asp.score > 0.15;
                  const isNeg = asp.score < -0.15;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate">{asp.aspect}</span>
                        <span className={`font-mono font-bold text-[11px] ${isPos ? 'text-emerald-600' : isNeg ? 'text-rose-600' : 'text-amber-600'}`}>
                          {asp.score > 0 ? `+${asp.score.toFixed(2)}` : asp.score.toFixed(2)}
                        </span>
                      </div>

                      {/* Progress bar (-1.0 to 1.0 mapped to 0% to 100%) */}
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : isNeg ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.max(5, Math.min(100, ((asp.score + 1) / 2) * 100))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Sentiment:</span>
                        <span className="font-semibold capitalize text-slate-700">{asp.sentiment}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drivers & Quotes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Key Narrative Drivers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Key Sentiment Drivers & Catalysts
                </h4>
                <div className="space-y-2">
                  {currentTopic.drivers.map((driver, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Representative Quotes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Representative Public & Stakeholder Quotes
                </h4>
                <div className="space-y-2">
                  {currentTopic.representativeQuotes?.map((quote, i) => {
                    const isPos = quote.sentiment === 'positive';
                    const isNeg = quote.sentiment === 'negative';
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl text-xs space-y-1 border ${
                          isPos
                            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                            : isNeg
                            ? 'bg-rose-50/50 border-rose-200/80 text-rose-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <p className="italic">"{quote.text}"</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span className="font-semibold">{quote.source}</span>
                          <span className="capitalize font-mono">{quote.sentiment} stance</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Mode */}
      {compareMode && currentTopic && compareTopic && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                Side-by-Side Topic Sentiment Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Contrast public sentiment reception, velocity, and aspect scores between two trending themes.
              </p>
            </div>
            <button
              onClick={() => setCompareMode(false)}
              className="text-xs text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Close Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic 1 */}
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Topic A</span>
              <h4 className="text-base font-bold text-slate-900">{currentTopic.name}</h4>
              <div className="flex items-center justify-center py-2">
                <SentimentGauge score={currentTopic.sentimentScore} size={150} label="Topic A Score" />
              </div>
              <SentimentDistributionBar
                positive={currentTopic.distribution.positive}
                neutral={currentTopic.distribution.neutral}
                negative={currentTopic.distribution.negative}
              />
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between"><span>Volume:</span><strong className="font-mono">{currentTopic.volume}</strong></div>
                <div className="flex justify-between"><span>24h Velocity:</span><strong className="font-mono text-emerald-600">{currentTopic.change24h}</strong></div>
              </div>
            </div>

            {/* Topic 2 */}
            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Topic B</span>
              <h4 className="text-base font-bold text-slate-900">{compareTopic.name}</h4>
              <div className="flex items-center justify-center py-2">
                <SentimentGauge score={compareTopic.sentimentScore} size={150} label="Topic B Score" />
              </div>
              <SentimentDistributionBar
                positive={compareTopic.distribution.positive}
                neutral={compareTopic.distribution.neutral}
                negative={compareTopic.distribution.negative}
              />
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between"><span>Volume:</span><strong className="font-mono">{compareTopic.volume}</strong></div>
                <div className="flex justify-between"><span>24h Velocity:</span><strong className="font-mono text-emerald-600">{compareTopic.change24h}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
