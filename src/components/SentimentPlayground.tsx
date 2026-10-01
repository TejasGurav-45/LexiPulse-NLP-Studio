import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  RotateCcw, 
  Layers, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Sliders,
  FileSearch,
  MessageSquare
} from 'lucide-react';
import { SentimentAnalysisResult } from '../types/nlp';
import { SentimentGauge, EmotionBars } from './SvgCharts';

const SAMPLE_TEXTS = [
  {
    label: 'Enterprise SaaS Review (Mixed ABSA)',
    text: `The newly released analytics dashboard features exceptional real-time query speeds and intuitive data visualization widgets that our executive team loves. However, customer support response times have deteriorated sharply to over 48 hours, and the recent 35% enterprise licensing price hike feels completely unwarranted for existing contracted teams.`
  },
  {
    label: 'CleanTech Breakthrough (Strongly Positive)',
    text: `Independent third-party laboratory verification confirms that the new perovskite-silicon tandem solar cell has achieved an extraordinary 34.6% operational efficiency with near-zero degradation after 1,000 thermal cycles. This monumental breakthrough paves the way for dramatically cheaper clean electricity worldwide.`
  },
  {
    label: 'Regulatory Cyber Warning (Cautious / Negative)',
    text: `Severe critical zero-day vulnerabilities have been detected across outdated edge gateway routers, creating alarming risks of remote code execution for financial backbones. Organizations must immediately deploy emergency patches, as active malicious exploitation has been confirmed in multiple jurisdictions.`
  },
  {
    label: 'Factual Whitepaper (Neutral / Objective)',
    text: `The algorithmic framework executes a distributed consensus protocol over a cluster of twelve validator nodes. Transaction throughput scales linearly up to five thousand operations per second, with cryptographic proofs verified using standard elliptic curve signatures.`
  }
];

export function SentimentPlayground() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [targetTopic, setTargetTopic] = useState('Enterprise Analytics');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 5) {
      setError('Please provide text to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/nlp/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetTopic: targetTopic.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to compute sentiment analysis.');
      }

      const data: SentimentAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during sentiment computation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Interactive Sentiment & Emotion Playground
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Test arbitrary text, customer feedback, earnings transcripts, or social threads for fine-grained polarity, emotion breakdown, and aspect sentiment.
          </p>
        </div>

        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presets:</span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(sample.text)}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {sample.label.split(' ')[0]} {sample.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Column & Diagnostics Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-indigo-600" />
                Input Text for Sentiment Evaluation
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {inputText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste reviews, statements, social posts, or press snippets..."
              className="w-full text-sm font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono leading-relaxed"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Target Entity / Context (e.g. "Pricing", "Battery Life", "Customer Support")
              </label>
              <input
                type="text"
                value={targetTopic}
                onChange={e => setTargetTopic(e.target.value)}
                placeholder="Target entity..."
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Computing Linguistic Sentiment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Run NLP Sentiment Analysis</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Diagnostics (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
              <h3 className="font-bold text-slate-800">Deconstructing Emotional Spectrum & Aspects</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Evaluating polarity gradient, subjectivity ratios, and aspect-level sentiment...
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Ready for Sentiment Evaluation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter text or pick a preset, then click "Run NLP Sentiment Analysis".
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Top Row: Polarity Gauge & Subjectivity */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                {/* Polarity Gauge */}
                <div className="md:col-span-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-4">
                  <SentimentGauge
                    score={Math.round(result.polarity * 100)}
                    min={-100}
                    max={100}
                    size={170}
                    label="Polarity Score (-1.0 to +1.0)"
                  />
                  <div className="text-center mt-2">
                    <span className="text-xs font-bold text-slate-900">
                      Overall: {result.label} (Score: {result.polarity > 0 ? `+${result.polarity.toFixed(2)}` : result.polarity.toFixed(2)})
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {/* Subjectivity & Summary */}
                <div className="md:col-span-6 flex flex-col justify-between space-y-3 pl-0 md:pl-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Subjectivity vs Objectivity
                    </span>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">Factual / Objective</span>
                        <span className="text-indigo-600 font-mono">{Math.round(result.subjectivity * 100)}% Subjective</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(result.subjectivity * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Executive Sentiment Finding:</strong>
                    {result.summary}
                  </div>
                </div>
              </div>

              {/* Emotion Spectrum Bars */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  6-Dimension Emotion & Tone Spectrum
                </h4>
                <EmotionBars emotions={result.emotions} />
              </div>

              {/* Aspect-Based Sentiment Decomposition */}
              {result.aspects?.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Aspect-Based Sentiment Analysis (ABSA)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.aspects.map((asp, idx) => {
                      const isPos = asp.score > 0.1;
                      const isNeg = asp.score < -0.1;
                      return (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{asp.aspect}</span>
                            <span className={`font-mono font-bold text-[11px] ${isPos ? 'text-emerald-600' : isNeg ? 'text-rose-600' : 'text-amber-600'}`}>
                              {asp.score > 0 ? `+${asp.score.toFixed(2)}` : asp.score.toFixed(2)}
                            </span>
                          </div>
                          {asp.excerpt && (
                            <p className="text-[11px] text-slate-500 italic bg-white p-1.5 rounded-md border border-slate-100">
                              "{asp.excerpt}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sentence-Level Heatmap */}
              {result.sentenceBreakdown?.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Sentence-by-Sentence Sentiment Heatmap
                  </h4>
                  <div className="space-y-2">
                    {result.sentenceBreakdown.map((item, idx) => {
                      const isPos = item.score > 0.15;
                      const isNeg = item.score < -0.15;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                            isPos
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : isNeg
                              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="leading-snug">{item.sentence}</span>
                          <span className={`shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isPos ? 'bg-emerald-200/70 text-emerald-900' : isNeg ? 'bg-rose-200/70 text-rose-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.score > 0 ? `+${item.score.toFixed(2)}` : item.score.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
