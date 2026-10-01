import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  Minimize2, 
  Gauge, 
  Bookmark, 
  Tag, 
  Sliders, 
  RotateCcw,
  Play,
  Pause,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SummaryResult, SummaryStyle, SummaryLength } from '../types/nlp';

// Sample long articles ready to load
const SAMPLE_ARTICLES = [
  {
    title: 'Compound AI Systems Architecture',
    tag: 'Technology & AI',
    words: 420,
    text: `For the past three years, the dominant paradigm in artificial intelligence has been the scaling of single monolithic transformer models. The assumption was straightforward: continuously increase parameter counts, feed expanding multimodal corpora, and emergent reasoning capabilities would naturally solve enterprise workflows. However, in corporate engineering suites and production deployments, a profound architectural inflection point has materialized.

Practitioners are finding that monolithic architectures hit critical operational walls: stochastic hallucination, opaque latency spikes, prohibitive inference expenditures, and brittle tool execution. In response, modern system designers are transitioning toward "Compound AI Systems" — architectures where foundation models act not as end-to-end solitary arbiters, but as modular reasoning engines embedded within deterministic state machines, vector retrieval pipelines, structured validators, and specialized micro-agents.

Consider code verification and legal document audit systems. A single large model attempting to parse a 200-page prospectus and simultaneously generate clause-by-clause compliance checks suffers an attention degradation known as the "lost in the middle" phenomenon. In a compound architecture, the workflow is disaggregated: an extractive parser tokenizes the text into semantic sections, parallel lightweight embedding models index structural references, an orchestrator plans verification sub-goals, specialized domain classifiers scrutinize tax implications, and a deterministic rule engine confirms statutory adherence before anything is committed to a client database.

The commercial impact of this architectural shift is substantial. Early benchmarks across fintech and healthcare reveal that compound architectures achieve a 4.2x reduction in token consumption while elevating operational accuracy from 76% to over 97.4%. Furthermore, debugging failure modes shifts from black-box prompt wrangling to standard software diagnostics: when a compound pipeline misfires, telemetry pinpointing whether the retriever failed, the validator rejected, or the model hallucinated is readily accessible.

Naturally, challenges remain. Managing asynchronous state, race conditions between collaborating agents, and distributed latency budgets requires mature orchestration tooling that mirrors traditional cloud microservices. Yet the consensus among engineering leaders is unmistakable: the future of industrial AI belongs not to bigger solitary brains, but to resilient, orchestrated ecosystems of targeted intelligences.`
  },
  {
    title: 'Grid-Scale Sodium & LFP Batteries',
    tag: 'Energy & Climate',
    words: 390,
    text: `A quiet revolution has taken place across global electrical grids over the past twelve months. Long heralded as the indispensable missing piece for 24/7 intermittent solar and wind generation, utility-scale battery energy storage systems (BESS) have crossed the long-sought economic parity threshold against conventional natural gas peaker plants.

According to audited figures from utility consortiums across North America, Europe, and East Asia, levelized cost of storage (LCOS) for four-hour duration deployments has plummeted below $58 per megawatt-hour. This collapse in capital cost has been driven by a dual catalyst: the industrial oversupply and supply-chain maturation of lithium iron phosphate (LFP) cells, coupled with the rapid commercialization of earth-abundant sodium-ion battery lines that completely bypass cobalt, nickel, and volatile lithium supply chains.

In desert regions of California, Texas, and southern Spain, battery systems are routinely discharging over 15 gigawatts during dusk ramp hours, absorbing midday solar curtailment that previously went to waste. Traditional fossil fuel operators who once counted on peaker plants running 300 hours annually during extreme demand spikes are finding their revenue economics dismantled by storage installations that activate in sub-second response times with zero carbon emissions.

Transmission operators emphasize that modern grid batteries provide essential ancillary services beyond simple kilowatt-hour balancing. Advanced grid-forming inverters allow battery banks to simulate rotational inertia, stabilizing frequency oscillations and preventing localized brownouts far more effectively than aging steam turbines. While bottlenecks persist — notably 3-to-5 year utility interconnection study queues and high-voltage transformer shortages — the fundamental economic calculus has decisively tipped.`
  },
  {
    title: 'The Dual Economy Dilemma',
    tag: 'Markets & Finance',
    words: 360,
    text: `Global equity indices have consistently set all-time highs throughout the third quarter, fueled by staggering capital expenditures in artificial intelligence, robust corporate balance sheets among mega-cap tech conglomerates, and anticipation of monetary easing. Yet beneath this triumphant headline performance lies a starkly bifurcated economic reality that policymakers are struggling to reconcile.

For top-quintile households and asset owners, wealth effects are pronounced. Investment portfolios, housing equity, and high-yield cash equivalents have produced unprecedented liquidity buffers. High-income consumers continue to fuel luxury travel, premium automotive purchases, and asset acquisitions with remarkable indifference to prevailing interest rates.

Conversely, for the bottom 60% of households whose primary financial exposure is wage income without substantial real asset ownership, the cumulative impact of a 24% price rise since 2020 has created severe balance-sheet stress. Credit card delinquencies exceeding 90 days have climbed to their highest levels since 2011. Auto loan default rates among subprime and near-prime borrowers have breached 6.8%, and personal savings rates have compressed to 3.4% of disposable income.

Retail executives are noting this bifurcation with increasing clarity on earnings calls. While premium retailers report resilient average basket sizes, discount and mass-market chains describe consumers trading down across essential grocery categories, cutting discretionary apparel, and relying on Buy Now Pay Later loans for basic household necessities.`
  }
];

interface ArticleSummarizerProps {
  initialText?: string | null;
}

export function ArticleSummarizer({ initialText }: ArticleSummarizerProps = {}) {
  const [inputText, setInputText] = useState(initialText || SAMPLE_ARTICLES[0].text);
  const [selectedSample, setSelectedSample] = useState(initialText ? -1 : 0);
  const [style, setStyle] = useState<SummaryStyle>('structured');
  const [length, setLength] = useState<SummaryLength>('balanced');
  const [focusArea, setFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Text-To-Speech states
  const [speaking, setSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setSelectedSample(-1);
    }
  }, [initialText]);

  // Auto run initial sample on mount if desired
  useEffect(() => {
    handleSummarize();
  }, []);

  const handleSelectSample = (idx: number) => {
    setSelectedSample(idx);
    setInputText(SAMPLE_ARTICLES[idx].text);
  };

  const handleSummarize = async () => {
    if (!inputText || inputText.trim().length < 20) {
      setError('Please provide at least 20 characters of article text.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech();

    try {
      const response = await fetch('/api/nlp/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          style,
          length,
          focusArea: focusArea.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Summarization request failed');
      }

      const data: SummaryResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the summary.');
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech audio player using Web Speech API
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!result) return;

    window.speechSynthesis.cancel();
    const readableText = `${result.title}. TLDR: ${result.tldr}. Key Takeaways: ${result.keyTakeaways.join('. ')}. Detailed Summary: ${result.summary.replace(/[#*_`]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.rate = speechRate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis && speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const content = `# ${result.title}

> **TL;DR**: ${result.tldr}

## Metrics & NLP Diagnostics
- Original Word Count: ${result.metrics.originalWordCount}
- Summary Word Count: ${result.metrics.summaryWordCount} (${result.metrics.compressionRatio} compression)
- Reading Time Saved: ${result.metrics.timeSaved}
- Overall Sentiment: ${result.overallSentiment.label} (${result.overallSentiment.score})

## Key Takeaways
${result.keyTakeaways.map(t => `- ${t}`).join('\n')}

## Summary
${result.summary}

## Key Entities
- People: ${result.keyEntities.people.join(', ') || 'N/A'}
- Organizations: ${result.keyEntities.organizations.join(', ') || 'N/A'}
- Concepts & Technologies: ${result.keyEntities.technologiesOrConcepts.join(', ') || 'N/A'}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Long Article NLP Summarizer
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Condense lengthy academic papers, news articles, and strategic briefings with customizable compression, tone, and entity extraction.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Samples:</span>
          {SAMPLE_ARTICLES.map((sample, idx) => (
            <button
              key={sample.title}
              onClick={() => handleSelectSample(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedSample === idx
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Column & Output Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Controls (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Source Article Text
              </label>
              <div className="text-xs text-slate-500 font-mono">
                {inputText.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedSample(-1);
              }}
              placeholder="Paste article, report, or essay text here..."
              className="w-full text-sm font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono leading-relaxed"
            />

            {/* Summarization Settings */}
            <div className="pt-2 border-t border-slate-100 space-y-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                NLP Engine Configuration
              </div>

              {/* Style selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Summary Style & Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'structured', label: 'Structured' },
                    { id: 'executive', label: 'Executive' },
                    { id: 'takeaways', label: 'Takeaways' },
                    { id: 'eli5', label: 'ELI5 Plain' },
                    { id: 'analytical', label: 'Deep Analyst' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id as SummaryStyle)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-center transition-all cursor-pointer ${
                        style === s.id
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length / Compression control */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Length / Compression
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'concise', label: 'Concise (~20%)' },
                    { id: 'balanced', label: 'Balanced (~35%)' },
                    { id: 'comprehensive', label: 'In-Depth (~50%)' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id as SummaryLength)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg text-center transition-all cursor-pointer ${
                        length === l.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional focus area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Focus Aspect / Entity (e.g. "Security", "Cost", "Clinical Trials")
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="Leave empty for broad overview, or enter topic..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSummarize}
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Processing NLP Extraction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Generate Structured Summary</span>
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
        </div>

        {/* Right Column: Output & Diagnostics (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Synthesizing Text & Extracting Entities</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Model is parsing semantic hierarchies, computing compression ratios, and classifying named entities...
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Ready for NLP Processing</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select one of the sample articles or paste any long document, then click "Generate Structured Summary".
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Metrics Diagnostic Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Compression</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                    {result.metrics.compressionRatio}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {result.metrics.originalWordCount} → {result.metrics.summaryWordCount} words
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Time Saved</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-700 mt-0.5 font-mono">
                    {result.metrics.timeSaved}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {result.metrics.originalReadingTime} → {result.metrics.summaryReadingTime}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Readability</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {result.readability?.estimatedGradeLevel || 'Professional'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {result.readability?.complexity || 'Balanced'} complexity
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tone / Sentiment</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${result.overallSentiment.score >= 0.2 ? 'bg-emerald-500' : result.overallSentiment.score <= -0.2 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <span>{result.overallSentiment.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Score: {result.overallSentiment.score > 0 ? `+${result.overallSentiment.score}` : result.overallSentiment.score}
                  </div>
                </div>
              </div>

              {/* Main Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Header with Actions & Audio Player */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      NLP Synthesis
                    </span>
                    <h3 className="text-base sm:text-lg font-bold leading-snug">
                      {result.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audio Listen Aloud */}
                    <button
                      onClick={toggleSpeech}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        speaking 
                          ? 'bg-amber-400 text-slate-900 animate-pulse'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title={speaking ? 'Pause / Stop reading' : 'Listen to audio briefing'}
                    >
                      {speaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{speaking ? 'Stop Audio' : 'Listen Aloud'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyToClipboard(result.summary, 'summary')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Copy summary markdown"
                    >
                      {copiedKey === 'summary' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Download Markdown */}
                    <button
                      onClick={downloadMarkdown}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Download Markdown file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* TL;DR Highlight Banner */}
                <div className="p-4 sm:p-5 bg-blue-50/70 border-b border-blue-100 flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-md bg-blue-600 text-white shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Executive TL;DR
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-950 font-medium mt-1 leading-relaxed">
                      {result.tldr}
                    </p>
                  </div>
                </div>

                {/* Structured Summary Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Key Takeaways */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                      Key Bullet Takeaways
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.keyTakeaways.map((takeaway, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Full Synthesized Briefing
                    </h4>
                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-3 text-xs sm:text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {result.summary.split('\n\n').map((para, i) => {
                        if (para.startsWith('### ')) {
                          return (
                            <h5 key={i} className="font-bold text-slate-900 text-sm mt-3 mb-1">
                              {para.replace('### ', '')}
                            </h5>
                          );
                        }
                        if (para.startsWith('- ')) {
                          return (
                            <ul key={i} className="list-disc pl-5 space-y-1">
                              {para.split('\n').map((line, li) => (
                                <li key={li}>{line.replace('- ', '')}</li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={i}>{para}</p>;
                      })}
                    </div>
                  </div>

                  {/* Named Entity Extraction (NER) */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      Named Entities Extracted (NER)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Concepts / Technologies */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Technologies & Concepts
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {result.keyEntities.technologiesOrConcepts?.map((concept, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Organizations */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Organizations & Groups
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {result.keyEntities.organizations?.map((org, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                              {org}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* People & Figures */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          People & Figures
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {result.keyEntities.people?.length > 0 ? (
                            result.keyEntities.people.map((person, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                                {person}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">None specifically named</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlight Quotes */}
                  {result.highlightQuotes?.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Primary Extracted Evidence Quotes
                      </h4>
                      <div className="space-y-2">
                        {result.highlightQuotes.map((quote, i) => (
                          <blockquote key={i} className="text-xs italic text-slate-600 border-l-2 border-blue-500 pl-3 py-1 bg-slate-50/50 rounded-r-lg">
                            "{quote.replace(/^["']|["']$/g, '')}"
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
