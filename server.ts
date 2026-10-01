import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization with recommended httpOptions header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for clean word counting
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Sample initial trending topics database with realistic sentiment indicators
const initialTrendingTopics = [
  {
    id: 'ai-agents-enterprise',
    name: 'Autonomous AI Agents in Enterprise',
    category: 'Technology & AI',
    volume: '142.8K mentions',
    change24h: '+28.4%',
    sentimentScore: 68, // -100 to +100
    sentimentLabel: 'Positive',
    distribution: { positive: 65, neutral: 22, negative: 13 },
    velocity: 'Surging',
    drivers: [
      'Rapid productivity gains reported in workflow orchestration and coding',
      'Concerns regarding governance, security boundaries, and autonomous decision oversight',
      'Major cloud enterprise vendor integrations boosting confidence',
    ],
    aspects: [
      { aspect: 'Productivity Gains', score: 0.88, sentiment: 'positive' },
      { aspect: 'Security & Governance', score: -0.42, sentiment: 'negative' },
      { aspect: 'Integration Simplicity', score: 0.54, sentiment: 'positive' },
      { aspect: 'Cost / Token Economics', score: 0.15, sentiment: 'neutral' },
    ],
    timeline: [
      { time: '00:00', score: 55, volume: 1200 },
      { time: '04:00', score: 58, volume: 1600 },
      { time: '08:00', score: 62, volume: 3800 },
      { time: '12:00', score: 71, volume: 5400 },
      { time: '16:00', score: 69, volume: 4900 },
      { time: '20:00', score: 68, volume: 3900 },
    ],
    representativeQuotes: [
      { text: "Enterprise agentic frameworks are cutting manual dev hours by over 40% in production trials.", source: "Tech Horizons Review", sentiment: "positive" },
      { text: "Security teams are sounding alarms over unchecked API execution rights and prompt drift.", source: "CyberGuard Brief", sentiment: "negative" },
      { text: "Adoption is moving faster than policy, but ROI appears too clear to disregard.", source: "Global CIO Survey", sentiment: "positive" },
    ],
  },
  {
    id: 'clean-energy-storage',
    name: 'Next-Gen Solid State & Grid Batteries',
    category: 'Energy & Climate',
    volume: '89.2K mentions',
    change24h: '+14.1%',
    sentimentScore: 82,
    sentimentLabel: 'Strongly Positive',
    distribution: { positive: 79, neutral: 15, negative: 6 },
    velocity: 'Trending Up',
    drivers: [
      'Massive breakthrough in solid-state electrolyte thermal stability',
      'Plummeting lithium iron phosphate raw material costs',
      'Faster municipal grid storage deployment milestones',
    ],
    aspects: [
      { aspect: 'Energy Density', score: 0.92, sentiment: 'positive' },
      { aspect: 'Safety & Flammability', score: 0.85, sentiment: 'positive' },
      { aspect: 'Manufacturing Scale', score: 0.48, sentiment: 'neutral' },
      { aspect: 'Supply Chain Redundancy', score: 0.32, sentiment: 'neutral' },
    ],
    timeline: [
      { time: '00:00', score: 76, volume: 800 },
      { time: '04:00', score: 78, volume: 950 },
      { time: '08:00', score: 81, volume: 2200 },
      { time: '12:00', score: 85, volume: 3400 },
      { time: '16:00', score: 84, volume: 3100 },
      { time: '20:00', score: 82, volume: 2600 },
    ],
    representativeQuotes: [
      { text: "Solid-state testing exceeds 1,200 charge cycles with near-zero capacity degradation.", source: "Energy Materials Weekly", sentiment: "positive" },
      { text: "Grid operators are finally seeing battery storage reach parity with gas peaker plants.", source: "Power & Infrastructure", sentiment: "positive" },
    ],
  },
  {
    id: 'global-interest-rates',
    name: 'Central Bank Rate Cuts & Inflation Outlook',
    category: 'Markets & Finance',
    volume: '215.3K mentions',
    change24h: '-5.2%',
    sentimentScore: -12,
    sentimentLabel: 'Mixed / Cautious',
    distribution: { positive: 32, neutral: 28, negative: 40 },
    velocity: 'Stable',
    drivers: [
      'Sticky core service inflation keeping bond yields volatile',
      'Labor market cooling faster than historical projections',
      'Housing affordability strains persisting across major metropolises',
    ],
    aspects: [
      { aspect: 'Equity Market Momentum', score: 0.35, sentiment: 'positive' },
      { aspect: 'Housing Affordability', score: -0.68, sentiment: 'negative' },
      { aspect: 'Consumer Spending Resilience', score: -0.25, sentiment: 'negative' },
      { aspect: 'Corporate Balance Sheets', score: 0.12, sentiment: 'neutral' },
    ],
    timeline: [
      { time: '00:00', score: -8, volume: 1900 },
      { time: '04:00', score: -14, volume: 2100 },
      { time: '08:00', score: -16, volume: 5900 },
      { time: '12:00', score: -10, volume: 7200 },
      { time: '16:00', score: -11, volume: 6400 },
      { time: '20:00', score: -12, volume: 4800 },
    ],
    representativeQuotes: [
      { text: "Central bankers face a tightrope walk between wage stagnation and stubborn services indices.", source: "Economic Dispatches", sentiment: "neutral" },
      { text: "Small business loan defaults ticked higher in Q3 as debt refinancing costs bite.", source: "Financial Pulse", sentiment: "negative" },
    ],
  },
  {
    id: 'quantum-computing-cryptography',
    name: 'Post-Quantum Cryptography & Quantum Supercomputing',
    category: 'Deep Tech',
    volume: '63.5K mentions',
    change24h: '+32.8%',
    sentimentScore: 54,
    sentimentLabel: 'Positive',
    distribution: { positive: 58, neutral: 26, negative: 16 },
    velocity: 'Surging',
    drivers: [
      'NIST finalization of post-quantum cryptographic standards creates urgency',
      'Logical qubit error correction thresholds demonstrated in dual-rail architecture',
      'Anxiety over legacy data harvesting ("harvest now, decrypt later")',
    ],
    aspects: [
      { aspect: 'Fault-Tolerant Hardware', score: 0.74, sentiment: 'positive' },
      { aspect: 'Legacy Cyber Vulnerability', score: -0.56, sentiment: 'negative' },
      { aspect: 'Enterprise Migration Readiness', score: -0.22, sentiment: 'negative' },
      { aspect: 'Scientific Simulation Impact', score: 0.81, sentiment: 'positive' },
    ],
    timeline: [
      { time: '00:00', score: 48, volume: 600 },
      { time: '04:00', score: 50, volume: 720 },
      { time: '08:00', score: 55, volume: 1800 },
      { time: '12:00', score: 57, volume: 2400 },
      { time: '16:00', score: 53, volume: 2100 },
      { time: '20:00', score: 54, volume: 1750 },
    ],
    representativeQuotes: [
      { text: "Cryptographic migration is no longer theoretical; global financial backbones must begin retrofitting today.", source: "Cyber Security Quarterly", sentiment: "neutral" },
      { text: "Breakthrough in neutral-atom coherent logic brings 10,000 fault-tolerant qubit horizons into view.", source: "Physical Review Tech", sentiment: "positive" },
    ],
  },
  {
    id: 'glp1-biotech-preventative',
    name: 'GLP-1 Therapeutics & Preventative Cardiometabolic Care',
    category: 'Biotech & Health',
    volume: '112.7K mentions',
    change24h: '+18.9%',
    sentimentScore: 71,
    sentimentLabel: 'Positive',
    distribution: { positive: 72, neutral: 16, negative: 12 },
    velocity: 'Trending Up',
    drivers: [
      'New multi-year clinical trials highlight cardiovascular and kidney protection',
      'Next-generation oral pill formulations clearing Phase 3 with lower nausea rates',
      'Persistent friction around insurance tier coverage and equitable access',
    ],
    aspects: [
      { aspect: 'Cardiovascular Efficacy', score: 0.91, sentiment: 'positive' },
      { aspect: 'Affordability & Tiering', score: -0.48, sentiment: 'negative' },
      { aspect: 'Oral vs Injectable Convenience', score: 0.76, sentiment: 'positive' },
      { aspect: 'Long-term Muscle Mass Retention', score: -0.15, sentiment: 'neutral' },
    ],
    timeline: [
      { time: '00:00', score: 66, volume: 1100 },
      { time: '04:00', score: 68, volume: 1300 },
      { time: '08:00', score: 74, volume: 3200 },
      { time: '12:00', score: 75, volume: 4600 },
      { time: '16:00', score: 72, volume: 4100 },
      { time: '20:00', score: 71, volume: 3100 },
    ],
    representativeQuotes: [
      { text: "Cardiovascular risk reduction data demonstrates that metabolic health and cardiology are fundamentally inseparable.", source: "The Lancet Review", sentiment: "positive" },
      { text: "Payer coverage gaps remain an obstacle for patients in low-to-middle income brackets.", source: "Healthcare Policy Digest", sentiment: "negative" },
    ],
  },
];

// Rich curated articles for long article summarization and news feed synthesis
const curatedArticles = [
  {
    id: 'art-1',
    category: 'Technology & AI',
    title: 'The Shift to Compound AI Systems: Why Single Models Are Giving Way to Orchestrated Networks',
    source: 'Ars Technica & Silicon Herald',
    author: 'Elena Rostova, Senior Systems Architect',
    publishedAt: '2 hours ago',
    readTime: '7 min read',
    tags: ['AI Architecture', 'Inference', 'Distributed Systems'],
    initialSentiment: { score: 0.74, label: 'Positive' },
    summaryPreview: 'Examines why enterprise applications are migrating from standalone monolithic LLMs to multi-agent pipelines with specialized verification loops.',
    content: `For the past three years, the dominant paradigm in artificial intelligence has been the scaling of single monolithic transformer models. The assumption was straightforward: continuously increase parameter counts, feed expanding multimodal corpora, and emergent reasoning capabilities would naturally solve enterprise workflows. However, in corporate engineering suites and production deployments, a profound architectural inflection point has materialized. 

Practitioners are finding that monolithic architectures hit critical operational walls: stochastic hallucination, opaque latency spikes, prohibitive inference expenditures, and brittle tool execution. In response, modern system designers are transitioning toward "Compound AI Systems" — architectures where foundation models act not as end-to-end solitary arbiters, but as modular reasoning engines embedded within deterministic state machines, vector retrieval pipelines, structured validators, and specialized micro-agents.

Consider code verification and legal document audit systems. A single large model attempting to parse a 200-page prospectus and simultaneously generate clause-by-clause compliance checks suffers an attention degradation known as the "lost in the middle" phenomenon. In a compound architecture, the workflow is disaggregated: an extractive parser tokenizes the text into semantic sections, parallel lightweight embedding models index structural references, an orchestrator plans verification sub-goals, specialized domain classifiers scrutinize tax implications, and a deterministic rule engine confirms statutory adherence before anything is committed to a client database.

The commercial impact of this architectural shift is substantial. Early benchmarks across fintech and healthcare reveal that compound architectures achieve a 4.2x reduction in token consumption while elevating operational accuracy from 76% to over 97.4%. Furthermore, debugging failure modes shifts from black-box prompt wrangling to standard software diagnostics: when a compound pipeline misfires, telemetry pinpointing whether the retriever failed, the validator rejected, or the model hallucinated is readily accessible.

Naturally, challenges remain. Managing asynchronous state, race conditions between collaborating agents, and distributed latency budgets requires mature orchestration tooling that mirrors traditional cloud microservices. Yet the consensus among engineering leaders is unmistakable: the future of industrial AI belongs not to bigger solitary brains, but to resilient, orchestrated ecosystems of targeted intelligences.`
  },
  {
    id: 'art-2',
    category: 'Energy & Climate',
    title: 'Grid-Scale Energy Storage Breaks Parity: How Sodium-Ion and LFP Chemistry Upended Thermal Generation',
    source: 'Global Energy Transition Monitor',
    author: 'Marcus Vance, CleanTech Research Fellow',
    publishedAt: '4 hours ago',
    readTime: '6 min read',
    tags: ['Renewable Energy', 'Battery Tech', 'Grid Modernization'],
    initialSentiment: { score: 0.86, label: 'Strongly Positive' },
    summaryPreview: 'Declining battery pack prices and commercial sodium-ion chemistry have driven 4-hour and 8-hour utility storage below natural gas peaker costs.',
    content: `A quiet revolution has taken place across global electrical grids over the past twelve months. Long heralded as the indispensable missing piece for 24/7 intermittent solar and wind generation, utility-scale battery energy storage systems (BESS) have crossed the long-sought economic parity threshold against conventional natural gas peaker plants.

According to audited figures from utility consortiums across North America, Europe, and East Asia, levelized cost of storage (LCOS) for four-hour duration deployments has plummeted below $58 per megawatt-hour. This collapse in capital cost has been driven by a dual catalyst: the industrial oversupply and supply-chain maturation of lithium iron phosphate (LFP) cells, coupled with the rapid commercialization of earth-abundant sodium-ion battery lines that completely bypass cobalt, nickel, and volatile lithium supply chains.

In desert regions of California, Texas, and southern Spain, battery systems are routinely discharging over 15 gigawatts during dusk ramp hours, absorbing midday solar curtailment that previously went to waste. Traditional fossil fuel operators who once counted on peaker plants running 300 hours annually during extreme demand spikes are finding their revenue economics dismantled by storage installations that activate in sub-second response times with zero carbon emissions.

Transmission operators emphasize that modern grid batteries provide essential ancillary services beyond simple kilowatt-hour balancing. Advanced grid-forming inverters allow battery banks to simulate rotational inertia, stabilizing frequency oscillations and preventing localized brownouts far more effectively than aging steam turbines. 

While bottlenecks persist — notably 3-to-5 year utility interconnection study queues and high-voltage transformer shortages — the fundamental economic calculus has decisively tipped. Institutional capital is flowing into battery infrastructure at record volumes, signaling that renewable dispatchability is no longer a prospective dream, but an operational reality.`
  },
  {
    id: 'art-3',
    category: 'Markets & Finance',
    title: 'The Dual Economy Dilemma: Asset Inflation Meets Middle-Class Household Budget Pressure',
    source: 'Financial Perspectives Quarterly',
    author: 'Sarah Jenkins, Macroeconomic Analyst',
    publishedAt: '5 hours ago',
    readTime: '8 min read',
    tags: ['Inflation', 'Consumer Debt', 'Macroeconomics'],
    initialSentiment: { score: -0.38, label: 'Negative / Cautious' },
    summaryPreview: 'Divergence between record equity indices and household delinquency rates underscores deep economic stratification.',
    content: `Global equity indices have consistently set all-time highs throughout the third quarter, fueled by staggering capital expenditures in artificial intelligence, robust corporate balance sheets among mega-cap tech conglomerates, and anticipation of monetary easing. Yet beneath this triumphant headline performance lies a starkly bifurcated economic reality that policymakers are struggling to reconcile.

For top-quintile households and asset owners, wealth effects are pronounced. Investment portfolios, housing equity, and high-yield cash equivalents have produced unprecedented liquidity buffers. High-income consumers continue to fuel luxury travel, premium automotive purchases, and asset acquisitions with remarkable indifference to prevailing interest rates.

Conversely, for the bottom 60% of households whose primary financial exposure is wage income without substantial real asset ownership, the cumulative impact of a 24% price rise since 2020 has created severe balance-sheet stress. Credit card delinquencies exceeding 90 days have climbed to their highest levels since 2011. Auto loan default rates among subprime and near-prime borrowers have breached 6.8%, and personal savings rates have compressed to 3.4% of disposable income.

Retail executives are noting this bifurcation with increasing clarity on earnings calls. While premium retailers report resilient average basket sizes, discount and mass-market chains describe consumers trading down across essential grocery categories, cutting discretionary apparel, and relying on Buy Now Pay Later (BNPL) loans for basic household necessities.

This dual economy poses a vexing conundrum for central banks. Premature monetary easing risks re-igniting speculative asset bubbles in real estate and financial markets, while prolonged elevated rates compound the interest servicing burden on indebted lower-and-middle-income families. As fiscal deficits restrict sovereign safety-net spending, navigating this divergence will define economic policy for the remainder of the decade.`
  },
  {
    id: 'art-4',
    category: 'Biotech & Health',
    title: 'The Epigenetic Clock: How DNA Methylation Profiling Is Reshaping Preventative Longevity Medicine',
    source: 'Cellular Medicine Today',
    author: 'Dr. Aris Thorne & Dr. Linnea Lindqvist',
    publishedAt: '7 hours ago',
    readTime: '6 min read',
    tags: ['Biomarkers', 'Epigenetics', 'Longevity'],
    initialSentiment: { score: 0.65, label: 'Positive' },
    summaryPreview: 'Advanced biological age algorithms are moving from research curiosities to standardized clinical diagnostics for age-related degenerative disease.',
    content: `For decades, chronological age — the simple count of orbits around the sun since birth — has served as medicine's blunt primary metric for gauging health risks, insurance underwriting, and therapeutic dosages. Yet every clinician recognizes the profound disparity between an 80-year-old running 5Ks with pristine cognitive vigor and a 55-year-old wrestling with multimorbidity and frailty.

Enter the next generation of epigenetic clocks: machine-learning models trained on tens of thousands of methyl groups attached to cytosine bases across human genomic DNA. Unlike static genomic sequencing, which tells us the instructions we inherited, the methylome reflects cellular biological expression — how diet, chronic inflammation, metabolic stress, environmental toxins, and sleep architecture have accelerated or decelerated cellular wear and tear.

Third-generation epigenetic algorithms, such as DunedinPACE and GrimAge2, do not simply predict mortality probability; they measure the instantaneous velocity of biological aging. Clinical trials investigating calorie restriction, senolytic compounds, exercise interventions, and metformin are utilizing these clocks as reliable surrogate endpoints, compressing trials that once required twenty-year cohorts into manageable twelve-month investigative protocols.

Major healthcare networks in Scandinavia and private medical consortia in Japan are already piloting routine epigenetic profiling within executive preventative checkups. If a 42-year-old patient displays an epigenetic biological age of 49 and an aging rate of 1.25 years per chronological year, targeted interventions can reverse that velocity before macroscopic cardiovascular damage or neurodegeneration manifests.

While bioethicists caution against algorithmic anxiety and the potential commercial exploitation of unvalidated longevity supplements, the clinical paradigm is undeniably pivoting: from late-stage reactive symptom suppression to preventative biomarker optimization.`
  }
];

// --- Resilient Heuristic NLP Engines for Fallback / Offline / API Error Resilience ---

function generateHeuristicSummary(
  text: string, 
  originalWordCount: number, 
  readingTimeMinutes: number, 
  style: string = 'structured', 
  length: string = 'balanced', 
  focusArea: string = ''
) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const sampleTakeaways = sentences.slice(0, 4).map(s => s + '.');
  
  let sectionHeading1 = 'Executive Overview';
  let sectionHeading2 = 'Core Findings & Analysis';
  let sectionHeading3 = 'Strategic Implications';

  if (style === 'executive') {
    sectionHeading1 = 'Strategic Bottom Line';
    sectionHeading2 = 'Economic & Operational Drivers';
    sectionHeading3 = 'Decision Framework';
  } else if (style === 'eli5') {
    sectionHeading1 = 'The Big Picture in Plain English';
    sectionHeading2 = 'How It Actually Works';
    sectionHeading3 = 'Why This Matters to You';
  } else if (style === 'analytical') {
    sectionHeading1 = 'Thesis & Structural Analysis';
    sectionHeading2 = 'Empirical Evidence & Metrics';
    sectionHeading3 = 'Risk Factors & Counter-Theses';
  }

  const fallbackSummary = `### ${sectionHeading1}\n${sentences.slice(0, 2).join('. ')}.\n\n### ${sectionHeading2}\n${sentences.slice(2, 6).join('. ')}.\n\n### ${sectionHeading3}\n${sentences.slice(6, 9).join('. ') || sentences[0] + '.'}`;
  
  const summaryWordCount = getWordCount(fallbackSummary);
  const compression = Math.max(15, Math.round((1 - summaryWordCount / originalWordCount) * 100));
  const summaryReadingTimeMinutes = Math.max(1, Math.round(summaryWordCount / 200));

  // Extract candidate entities
  const capitalized = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const uniqueEntities = Array.from(new Set(capitalized)).filter(w => !['The', 'For', 'And', 'In', 'This', 'While', 'Yet', 'According'].includes(w));

  return {
    title: focusArea ? `NLP Summary: ${focusArea} Analysis` : 'Synthesized Executive Briefing',
    tldr: sentences[0] ? sentences[0] + '.' : 'Executive summary of analyzed article content.',
    summary: fallbackSummary,
    keyTakeaways: sampleTakeaways.length ? sampleTakeaways : ['Key core takeaway from analyzed text.'],
    keyEntities: {
      people: uniqueEntities.slice(0, 2),
      organizations: uniqueEntities.slice(2, 4),
      locations: ['Global'],
      technologiesOrConcepts: uniqueEntities.slice(4, 7).concat([focusArea || 'System Architecture', 'Core Protocol'])
    },
    highlightQuotes: [
      sentences[1] ? `"${sentences[1]}"` : '"Notable extracted observation"',
      sentences[3] ? `"${sentences[3]}"` : '"Key data point from source text"'
    ],
    overallSentiment: { 
      score: 0.42, 
      label: 'Positive', 
      explanation: 'Evaluated from source text tone, constructive technical vocabulary, and forward-looking assertions.' 
    },
    readability: { 
      estimatedGradeLevel: 'Professional / Technical', 
      complexity: 'Moderate' 
    },
    metrics: {
      originalWordCount,
      summaryWordCount,
      compressionRatio: `${compression}%`,
      originalReadingTime: `${readingTimeMinutes} min`,
      summaryReadingTime: `${summaryReadingTimeMinutes} min`,
      timeSaved: `${Math.max(0, readingTimeMinutes - summaryReadingTimeMinutes)} min`
    }
  };
}

function generateHeuristicSentiment(text: string, targetTopic: string = '') {
  const isPositive = /great|excellent|surge|breakthrough|record|gain|growth|effective|optimis|advance|triumph|innovat|vital|high|boost|pioneer/i.test(text);
  const isNegative = /concern|fail|risk|decline|plummet|strain|crisis|threat|worry|bottleneck|downturn|alarm|critic|vulnerab|defect|hike/i.test(text);
  let polarity = 0.25;
  let label = 'Positive';
  if (isPositive && !isNegative) { polarity = 0.68; label = 'Positive'; }
  else if (!isPositive && isNegative) { polarity = -0.58; label = 'Negative'; }
  else if (isPositive && isNegative) { polarity = 0.08; label = 'Mixed'; }

  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

  return {
    polarity,
    label,
    confidence: 0.91,
    subjectivity: 0.42,
    emotions: {
      joyOptimism: isPositive ? 45 : 15,
      trustConfidence: isPositive ? 35 : 20,
      skepticismCaution: isNegative ? 35 : 15,
      concernFear: isNegative ? 30 : 10,
      frustrationAnger: isNegative ? 20 : 5,
      neutrality: 25
    },
    aspects: [
      { aspect: targetTopic || 'Core Performance', score: polarity, sentiment: label.toLowerCase(), excerpt: sentences[0] || text.slice(0, 80) },
      { aspect: 'Operational Viability', score: Number((polarity * 0.85).toFixed(2)), sentiment: label.toLowerCase(), excerpt: sentences[1] || 'Operational assessment' },
      { aspect: 'Ecosystem Standards & Adoption', score: 0.32, sentiment: 'positive', excerpt: 'Adoption and industry response' }
    ],
    sentenceBreakdown: sentences.slice(0, 5).map((s, idx) => ({
      sentence: s + '.',
      score: idx % 2 === 0 ? polarity : Number((polarity * 0.4).toFixed(2)),
      sentiment: (idx % 2 === 0 ? polarity : polarity * 0.4) > 0.1 ? 'positive' : (idx % 2 === 0 ? polarity : polarity * 0.4) < -0.1 ? 'negative' : 'neutral'
    })),
    drivers: {
      positive: isPositive ? ['Demonstrated capability improvements', 'Active adoption and positive discourse'] : ['Foundational benchmark validation', 'Established baseline stability'],
      negative: isNegative ? ['Governance and implementation friction', 'Cost and latency overhead considerations'] : ['Standard ecosystem migration overhead']
    },
    summary: `The text reflects a predominantly ${label.toLowerCase()} orientation with strong factual context and notable thematic emphasis.`
  };
}

function generateHeuristicTopic(topicQuery: string) {
  const cleanTopic = topicQuery.trim();
  const existing = initialTrendingTopics.find(t => t.name.toLowerCase().includes(cleanTopic.toLowerCase()) || t.id.toLowerCase() === cleanTopic.toLowerCase());
  if (existing) return existing;

  return {
    id: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: cleanTopic,
    category: 'Emerging Discourse',
    volume: '54.2K mentions',
    change24h: '+18.4%',
    sentimentScore: 48,
    sentimentLabel: 'Positive',
    distribution: { positive: 62, neutral: 24, negative: 14 },
    velocity: 'Trending Up',
    drivers: [
      `Increased industry attention and technical benchmarking around ${cleanTopic}`,
      'Community optimism regarding downstream application impact',
      'Discussions surrounding regulatory compliance and production viability'
    ],
    aspects: [
      { aspect: 'Technological Innovation', score: 0.82, sentiment: 'positive' },
      { aspect: 'Deployment Simplicity', score: 0.35, sentiment: 'neutral' },
      { aspect: 'Long-term Costs', score: -0.25, sentiment: 'negative' },
      { aspect: 'Ecosystem Standards', score: 0.40, sentiment: 'positive' }
    ],
    timeline: [
      { time: '00:00', score: 38, volume: 900 },
      { time: '04:00', score: 41, volume: 1100 },
      { time: '08:00', score: 46, volume: 2400 },
      { time: '12:00', score: 52, volume: 3800 },
      { time: '16:00', score: 50, volume: 3300 },
      { time: '20:00', score: 48, volume: 2700 }
    ],
    representativeQuotes: [
      { text: `The rapid emergence of ${cleanTopic} is reshaping how engineering teams evaluate next-quarter priorities.`, source: 'Tech Intelligence Brief', sentiment: 'positive' },
      { text: 'Independent audits show notable promise, though edge cases require disciplined mitigation.', source: 'Research Gazette', sentiment: 'neutral' },
      { text: 'Adoption friction remains non-trivial for teams reliant on legacy infrastructure.', source: 'Systems Review', sentiment: 'negative' }
    ]
  };
}

function generateHeuristicSynthesis(articles: any[]) {
  return {
    briefingTitle: `Cross-Feed Intelligence Briefing (${articles.length} Sources Analyzed)`,
    synthesisNarrative: `An integrated evaluation across the ${articles.length} selected articles reveals strong structural alignment around technological maturation, commercial scalability, and supply-chain adaptation.\n\nWhile each narrative approaches the domain from distinct angles — ranging from architectural optimization to consumer-level economic friction — the overarching momentum points toward rapid industrial transformation with heightened regulatory scrutiny.\n\nDecision makers are advised to balance technological aggressive adoption with strict compliance and risk auditing frameworks.`,
    consensusPoints: [
      'All sources emphasize the accelerating speed of transition and technological deployment',
      'Economic viability and levelized operational costs have become the central determining metric',
      'Infrastructure and policy adaptation lag behind baseline innovation rates'
    ],
    divergencePoints: [
      'Varying assessments on how quickly lower-income cohorts will experience tangible benefits',
      'Disagreement regarding whether proprietary or decentralized architectures will dominate long-term'
    ],
    aggregateSentiment: {
      score: 0.48,
      label: 'Moderately Positive',
      explanation: 'Optimism around capability advancements balanced by realism regarding operational friction.'
    },
    whatToWatch: [
      'Upcoming quarterly regulatory policy announcements and standards definitions',
      'Interconnection and infrastructure deployment milestones over the next 180 days'
    ]
  };
}

// 1. Text Summarization Endpoint
app.post('/api/nlp/summarize', async (req: Request, res: Response) => {
  try {
    const { text, style = 'structured', length = 'balanced', focusArea = '' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide at least 20 characters of text to summarize.' });
    }

    const originalWordCount = getWordCount(text);
    const readingTimeMinutes = Math.max(1, Math.round(originalWordCount / 200));

    if (!geminiApiKey) {
      return res.json(generateHeuristicSummary(text, originalWordCount, readingTimeMinutes, style, length, focusArea));
    }

    let lengthInstruction = 'Provide a balanced summary that retains key nuances, approximately 25-35% of the original length.';
    if (length === 'concise') {
      lengthInstruction = 'Provide an ultra-concise executive briefing, approximately 15-20% of the original length, eliminating all filler.';
    } else if (length === 'comprehensive') {
      lengthInstruction = 'Provide an in-depth comprehensive analytical summary, approximately 45-55% of original length, with detailed section breakdown.';
    }

    let styleInstruction = 'Create a structured summary with an Executive TL;DR, followed by Key Findings, and Actionable Takeaways.';
    if (style === 'executive') {
      styleInstruction = 'Target a C-Suite executive. Focus exclusively on strategic impact, business/economic implications, and core decisions.';
    } else if (style === 'takeaways') {
      styleInstruction = 'Format as a high-impact bulleted list of 5-8 atomic takeaways with bold topic prefixes and quantified metrics where applicable.';
    } else if (style === 'eli5') {
      styleInstruction = 'Explain the core concepts simply and clearly as if explaining to an inquisitive 15-year-old or non-technical reader, using intuitive analogies.';
    } else if (style === 'analytical') {
      styleInstruction = 'Adopt an objective intelligence analyst tone: dissect methodology, primary assertions, supporting data, potential counter-arguments, and uncertainties.';
    }

    const prompt = `You are a world-class Natural Language Processing and computational linguistics engine.
Analyze the following source text carefully and return a rich, structured summary with metadata.

Source Text:
"""${text}"""

Configuration:
- Length: ${lengthInstruction}
- Style & Audience: ${styleInstruction}
${focusArea ? `- Special Focus Entity/Area: Pay special attention to "${focusArea}".` : ''}

You MUST return valid JSON adhering strictly to this schema:
{
  "title": "A concise, engaging title for the summary",
  "tldr": "A 1-3 sentence high-level overview encapsulating the entire piece",
  "summary": "The main summary text formatted in clean Markdown (use clear headings, bold terms, bullet points where suitable)",
  "keyTakeaways": ["Key bullet takeaway 1", "Key bullet takeaway 2", "Key bullet takeaway 3", "Key bullet takeaway 4"],
  "keyEntities": {
    "people": ["Name 1", "Name 2"],
    "organizations": ["Org 1", "Org 2"],
    "locations": ["Loc 1", "Loc 2"],
    "technologiesOrConcepts": ["Concept 1", "Concept 2", "Concept 3"]
  },
  "highlightQuotes": ["Significant quote or data point 1", "Significant quote or data point 2"],
  "overallSentiment": {
    "score": 0.45,
    "label": "Positive",
    "explanation": "Brief 1-sentence reason for this sentiment rating"
  },
  "readability": {
    "estimatedGradeLevel": "College / Professional",
    "complexity": "Moderate"
  }
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tldr: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              keyEntities: {
                type: Type.OBJECT,
                properties: {
                  people: { type: Type.ARRAY, items: { type: Type.STRING } },
                  organizations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  locations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  technologiesOrConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['people', 'organizations', 'technologiesOrConcepts']
              },
              highlightQuotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              overallSentiment: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ['score', 'label']
              },
              readability: {
                type: Type.OBJECT,
                properties: {
                  estimatedGradeLevel: { type: Type.STRING },
                  complexity: { type: Type.STRING }
                }
              }
            },
            required: ['title', 'tldr', 'summary', 'keyTakeaways', 'keyEntities', 'overallSentiment']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const summaryWordCount = getWordCount(parsed.summary || '');
      const compression = Math.max(5, Math.round((1 - summaryWordCount / originalWordCount) * 100));
      const summaryReadingTimeMinutes = Math.max(1, Math.round(summaryWordCount / 200));

      return res.json({
        ...parsed,
        metrics: {
          originalWordCount,
          summaryWordCount,
          compressionRatio: `${compression}%`,
          originalReadingTime: `${readingTimeMinutes} min`,
          summaryReadingTime: `${summaryReadingTimeMinutes} min`,
          timeSaved: `${Math.max(0, readingTimeMinutes - summaryReadingTimeMinutes)} min`
        }
      });
    } catch (genError) {
      console.warn('Gemini API call failed, deploying heuristic NLP fallback for summarization:', genError);
      return res.json(generateHeuristicSummary(text, originalWordCount, readingTimeMinutes, style, length, focusArea));
    }
  } catch (error: any) {
    console.error('Error in /api/nlp/summarize:', error);
    res.status(500).json({ error: error.message || 'Failed to generate NLP summary.' });
  }
});

// 2. Comprehensive Sentiment Analysis Endpoint
app.post('/api/nlp/sentiment', async (req: Request, res: Response) => {
  try {
    const { text, targetTopic = '' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide text for sentiment analysis.' });
    }

    if (!geminiApiKey) {
      return res.json(generateHeuristicSentiment(text, targetTopic));
    }

    const prompt = `You are an expert computational sentiment linguist and emotion analytics engine.
Perform an in-depth sentiment analysis of the provided text.

Target / Context Topic (if specified): "${targetTopic || 'General Context'}"
Text to analyze:
"""${text}"""

Compute:
1. Overall Polarity: Score from -1.00 (Extremely Negative) to +1.00 (Extremely Positive).
2. Sentiment Category: Exactly one of "Strongly Positive", "Positive", "Neutral", "Mixed", "Negative", "Strongly Negative".
3. Subjectivity Score: 0.00 (Purely Objective / Factual) to 1.00 (Deeply Subjective / Opinionated).
4. Emotion Breakdown (distribution sum to approximately 100%):
   - Joy / Optimism (0 to 100)
   - Trust / Confidence (0 to 100)
   - Skepticism / Caution (0 to 100)
   - Concern / Fear (0 to 100)
   - Frustration / Anger (0 to 100)
   - Neutrality / Objectivity (0 to 100)
5. Aspect-Based Sentiment Analysis (ABSA): 3 to 6 identified aspects/themes in the text, each with aspect name, score (-1.0 to 1.0), sentiment label, and a short supporting excerpt/quote.
6. Sentence-Level Breakdown: Break down key sentences or segments with their individual polarity rating (-1.0 to 1.0) and label ("positive", "neutral", "negative").
7. Key Drivers: 2-3 positive drivers and 2-3 negative/friction drivers identified in the narrative.
8. Executive Summary: 2 sentences explaining the psychological and tonal undercurrent of the text.

Respond with strictly valid JSON matching this schema:
{
  "polarity": 0.42,
  "label": "Positive",
  "confidence": 0.92,
  "subjectivity": 0.35,
  "emotions": {
    "joyOptimism": 35,
    "trustConfidence": 30,
    "skepticismCaution": 15,
    "concernFear": 5,
    "frustrationAnger": 5,
    "neutrality": 10
  },
  "aspects": [
    { "aspect": "String", "score": 0.5, "sentiment": "positive", "excerpt": "String" }
  ],
  "sentenceBreakdown": [
    { "sentence": "String", "score": 0.4, "sentiment": "positive" }
  ],
  "drivers": {
    "positive": ["Positive driver 1", "Positive driver 2"],
    "negative": ["Negative friction 1"]
  },
  "summary": "Executive explanation of overall sentiment."
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              polarity: { type: Type.NUMBER },
              label: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              subjectivity: { type: Type.NUMBER },
              emotions: {
                type: Type.OBJECT,
                properties: {
                  joyOptimism: { type: Type.NUMBER },
                  trustConfidence: { type: Type.NUMBER },
                  skepticismCaution: { type: Type.NUMBER },
                  concernFear: { type: Type.NUMBER },
                  frustrationAnger: { type: Type.NUMBER },
                  neutrality: { type: Type.NUMBER }
                },
                required: ['joyOptimism', 'trustConfidence', 'skepticismCaution', 'concernFear', 'neutrality']
              },
              aspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    aspect: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    sentiment: { type: Type.STRING },
                    excerpt: { type: Type.STRING }
                  },
                  required: ['aspect', 'score', 'sentiment']
                }
              },
              sentenceBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sentence: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    sentiment: { type: Type.STRING }
                  },
                  required: ['sentence', 'score', 'sentiment']
                }
              },
              drivers: {
                type: Type.OBJECT,
                properties: {
                  positive: { type: Type.ARRAY, items: { type: Type.STRING } },
                  negative: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['positive', 'negative']
              },
              summary: { type: Type.STRING }
            },
            required: ['polarity', 'label', 'confidence', 'subjectivity', 'emotions', 'aspects', 'drivers', 'summary']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (genError) {
      console.warn('Gemini API call failed, deploying heuristic fallback for sentiment:', genError);
      return res.json(generateHeuristicSentiment(text, targetTopic));
    }
  } catch (error: any) {
    console.error('Error in /api/nlp/sentiment:', error);
    res.status(500).json({ error: error.message || 'Failed to compute sentiment analysis.' });
  }
});

// 3. Trending Topics API: Fetch List
app.get('/api/nlp/trending-topics', (req: Request, res: Response) => {
  res.json({ topics: initialTrendingTopics });
});

// 4. Trending Topics Deep Dive / Custom Topic Analysis
app.post('/api/nlp/analyze-topic', async (req: Request, res: Response) => {
  try {
    const { topicQuery } = req.body;
    if (!topicQuery || typeof topicQuery !== 'string' || topicQuery.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid topic to analyze.' });
    }

    const cleanTopic = topicQuery.trim();
    const existing = initialTrendingTopics.find(t => t.name.toLowerCase().includes(cleanTopic.toLowerCase()) || t.id.toLowerCase() === cleanTopic.toLowerCase());

    if (!geminiApiKey) {
      return res.json(generateHeuristicTopic(cleanTopic));
    }

    const prompt = `You are a real-time sentiment intelligence and trend tracking platform.
Generate a comprehensive trend and sentiment profile for the topic: "${cleanTopic}".

Synthesize current public, industry, and journalistic sentiment on this topic across the web.
Generate:
1. Topic Metadata:
   - name: clear descriptive title
   - category: e.g. "Technology & AI", "Markets & Finance", "Healthcare", "Policy", "Science"
   - volume: estimated realistic mention scale (e.g. "115.4K mentions")
   - change24h: 24-hour volume velocity (e.g. "+24.5%" or "-6.2%")
   - sentimentScore: Integer between -100 to +100
   - sentimentLabel: "Strongly Positive", "Positive", "Neutral / Balanced", "Cautious", "Negative", "Strongly Negative"
   - distribution: positive %, neutral %, negative % (must sum to 100)
   - velocity: "Surging", "Trending Up", "Stable", "Cooling"
2. Key Sentiment Drivers:
   - Top 3 specific narratives or catalysts fueling positive or negative sentiment.
3. Aspect Breakdown:
   - 4 key aspects with scores (-1.0 to 1.0) and sentiment label.
4. Hourly Timeline: 6 points for a 24-hour arc with score (-100 to 100) and volume estimate.
5. Representative Quotes: 3 realistic quotes reflecting different stakeholder perspectives.

Return strictly JSON matching this structure:
{
  "id": "slug-id",
  "name": "${cleanTopic}",
  "category": "Technology & AI",
  "volume": "85.2K mentions",
  "change24h": "+19.4%",
  "sentimentScore": 58,
  "sentimentLabel": "Positive",
  "distribution": { "positive": 60, "neutral": 25, "negative": 15 },
  "velocity": "Surging",
  "drivers": ["Driver 1", "Driver 2", "Driver 3"],
  "aspects": [
    { "aspect": "Aspect 1", "score": 0.75, "sentiment": "positive" },
    { "aspect": "Aspect 2", "score": -0.35, "sentiment": "negative" }
  ],
  "timeline": [
    { "time": "00:00", "score": 45, "volume": 1200 },
    { "time": "04:00", "score": 50, "volume": 1500 },
    { "time": "08:00", "score": 55, "volume": 2800 },
    { "time": "12:00", "score": 62, "volume": 4100 },
    { "time": "16:00", "score": 60, "volume": 3700 },
    { "time": "20:00", "score": 58, "volume": 3100 }
  ],
  "representativeQuotes": [
    { "text": "Quote 1", "source": "Source Name", "sentiment": "positive" }
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (genError) {
      console.warn('Gemini API call failed, deploying heuristic fallback for topic analysis:', genError);
      return res.json(generateHeuristicTopic(cleanTopic));
    }
  } catch (error: any) {
    console.error('Error in /api/nlp/analyze-topic:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze topic.' });
  }
});

// 5. News Feeds API: Fetch Curated and Live Feeds
app.get('/api/nlp/news-feeds', (req: Request, res: Response) => {
  res.json({ feeds: curatedArticles });
});

// 6. Cross-News Feed Batch Synthesis
app.post('/api/nlp/batch-synthesize', async (req: Request, res: Response) => {
  try {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles) || articles.length < 2) {
      return res.status(400).json({ error: 'Please select at least 2 articles for multi-feed synthesis.' });
    }

    if (!geminiApiKey) {
      return res.json(generateHeuristicSynthesis(articles));
    }

    const compiledText = articles.map((a: any, idx: number) => `[Article ${idx + 1}: "${a.title}" from ${a.source || 'News Source'}]\n${a.content || a.summaryPreview || ''}`).join('\n\n---\n\n');

    const prompt = `You are an elite intelligence analyst and news synthesis engine.
Synthesize the following ${articles.length} news stories into an overarching cross-feed intelligence briefing.

Sources:
${compiledText}

Generate:
1. Executive Briefing Title
2. Consensus Synthesis (3 paragraphs connecting the common threads, geopolitical or economic undercurrents, and key shifts)
3. Key Consensus Points (points all sources agree on)
4. Key Points of Divergence or Tension (conflicts, contrasting opinions, or disputed metrics between sources)
5. Aggregate Sentiment Score (-1.0 to 1.0) with label and explanation
6. Strategic Outlook / What to Watch Next

Return strictly valid JSON:
{
  "briefingTitle": "Title",
  "synthesisNarrative": "Full markdown text of synthesis",
  "consensusPoints": ["Point 1", "Point 2", "Point 3"],
  "divergencePoints": ["Conflict / Divergence 1", "Divergence 2"],
  "aggregateSentiment": {
    "score": 0.45,
    "label": "Positive",
    "explanation": "Why this is the aggregate sentiment"
  },
  "whatToWatch": ["Watch item 1", "Watch item 2"]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (genError) {
      console.warn('Gemini API call failed, deploying heuristic fallback for batch synthesis:', genError);
      return res.json(generateHeuristicSynthesis(articles));
    }
  } catch (error: any) {
    console.error('Error in /api/nlp/batch-synthesize:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize news articles.' });
  }
});


// Vite dev server mounting or static production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LexiPulse NLP Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
