export type SummaryStyle = 'executive' | 'takeaways' | 'structured' | 'eli5' | 'analytical';
export type SummaryLength = 'concise' | 'balanced' | 'comprehensive';

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
  technologiesOrConcepts: string[];
}

export interface SummaryResult {
  title: string;
  tldr: string;
  summary: string;
  keyTakeaways: string[];
  keyEntities: KeyEntities;
  highlightQuotes: string[];
  overallSentiment: {
    score: number;
    label: string;
    explanation?: string;
  };
  readability?: {
    estimatedGradeLevel: string;
    complexity: string;
  };
  metrics: {
    originalWordCount: number;
    summaryWordCount: number;
    compressionRatio: string;
    originalReadingTime: string;
    summaryReadingTime: string;
    timeSaved: string;
  };
}

export interface AspectSentiment {
  aspect: string;
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral' | string;
  excerpt?: string;
}

export interface SentenceSentiment {
  sentence: string;
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral' | string;
}

export interface SentimentAnalysisResult {
  polarity: number; // -1.0 to 1.0
  label: string;
  confidence: number;
  subjectivity: number; // 0 to 1.0
  emotions: {
    joyOptimism: number;
    trustConfidence: number;
    skepticismCaution: number;
    concernFear: number;
    frustrationAnger: number;
    neutrality: number;
  };
  aspects: AspectSentiment[];
  sentenceBreakdown: SentenceSentiment[];
  drivers: {
    positive: string[];
    negative: string[];
  };
  summary: string;
}

export interface TimelinePoint {
  time: string;
  score: number;
  volume: number;
}

export interface RepresentativeQuote {
  text: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral' | string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  volume: string;
  change24h: string;
  sentimentScore: number; // -100 to +100
  sentimentLabel: string;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  velocity: string;
  drivers: string[];
  aspects: AspectSentiment[];
  timeline: TimelinePoint[];
  representativeQuotes: RepresentativeQuote[];
}

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  source: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  initialSentiment: {
    score: number;
    label: string;
  };
  summaryPreview: string;
  content: string;
}

export interface CrossFeedSynthesisResult {
  briefingTitle: string;
  synthesisNarrative: string;
  consensusPoints: string[];
  divergencePoints: string[];
  aggregateSentiment: {
    score: number;
    label: string;
    explanation: string;
  };
  whatToWatch: string[];
}
