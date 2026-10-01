import React, { useState } from 'react';
import { TimelinePoint } from '../types/nlp';

// 1. Sentiment Arched Gauge
export function SentimentGauge({
  score,
  min = -100,
  max = 100,
  size = 180,
  label = 'Sentiment Score'
}: {
  score: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const normalized = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const angle = -180 + normalized * 180; // -180deg to 0deg

  // Color scheme based on normalized score
  let strokeColor = '#10b981'; // emerald
  let statusText = 'Positive';
  if (normalized < 0.4) {
    strokeColor = '#f43f5e'; // rose
    statusText = 'Negative';
  } else if (normalized < 0.6) {
    strokeColor = '#f59e0b'; // amber
    statusText = 'Neutral';
  }

  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.6;
  const strokeWidth = size * 0.08;

  // Arc path for background
  const startX = cx - radius;
  const endX = cx + radius;
  const bgPath = `M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`;

  // Current value arc path
  const currentAngleRad = (Math.PI * (angle + 180)) / 180;
  const valX = cx - radius * Math.cos(currentAngleRad);
  const valY = cy - radius * Math.sin(currentAngleRad);
  const largeArc = normalized > 0.5 ? 1 : 0;
  const valPath = normalized > 0.02 
    ? `M ${startX} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${valX} ${valY}`
    : '';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg width={size} height={size * 0.72} className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled active track */}
        {valPath && (
          <path
            d={valPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Center score readout */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          className="font-bold fill-slate-900"
          style={{ fontSize: `${size * 0.19}px` }}
        >
          {score > 0 ? `+${Math.round(score)}` : Math.round(score)}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-slate-500 font-medium"
          style={{ fontSize: `${size * 0.08}px` }}
        >
          {statusText}
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// 2. Interactive Timeline Chart
export function TimelineChart({
  points,
  height = 180,
}: {
  points: TimelinePoint[];
  height?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!points || points.length < 2) return null;

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const width = 500;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minScore = -100;
  const maxScore = 100;

  const getX = (idx: number) => paddingLeft + (idx / (points.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + (1 - (val - minScore) / (maxScore - minScore)) * chartHeight;

  // Zero-line Y
  const zeroY = getY(0);

  // Line path generator
  const linePoints = points.map((p, idx) => `${getX(idx)},${getY(p.score)}`).join(' ');
  const areaPath = `M ${getX(0)} ${zeroY} ` + points.map((p, idx) => `L ${getX(idx)} ${getY(p.score)}`).join(' ') + ` L ${getX(points.length - 1)} ${zeroY} Z`;

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[-50, 0, 50].map((level) => {
          const y = getY(level);
          return (
            <g key={level}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={level === 0 ? '#94a3b8' : '#f1f5f9'}
                strokeWidth={level === 0 ? 1.5 : 1}
                strokeDasharray={level === 0 ? '4 3' : undefined}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {level > 0 ? `+${level}` : level}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Main curve */}
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />

        {/* Points and interaction */}
        {points.map((p, idx) => {
          const cx = getX(idx);
          const cy = getY(p.score);
          const isHovered = hoveredIdx === idx;
          return (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              {/* Invisible touch target */}
              <circle cx={cx} cy={cy} r={14} fill="transparent" />

              {/* Data point circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={p.score >= 0 ? '#10b981' : '#f43f5e'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* X-axis label */}
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                className={`text-[10px] font-mono ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
              >
                {p.time}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-lg text-xs transform -translate-x-1/2 -translate-y-12 z-20"
          style={{
            left: `${(getX(hoveredIdx) / width) * 100}%`,
            top: `${(getY(points[hoveredIdx].score) / height) * 100}%`,
          }}
        >
          <div className="font-semibold flex items-center gap-1.5">
            <span>Score:</span>
            <span className={points[hoveredIdx].score >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {points[hoveredIdx].score > 0 ? `+${points[hoveredIdx].score}` : points[hoveredIdx].score}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {points[hoveredIdx].volume.toLocaleString()} mentions at {points[hoveredIdx].time}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Three-Segment Sentiment Distribution Bar
export function SentimentDistributionBar({
  positive,
  neutral,
  negative,
  showLabels = true,
}: {
  positive: number;
  neutral: number;
  negative: number;
  showLabels?: boolean;
}) {
  const total = positive + neutral + negative || 100;
  const posPct = Math.round((positive / total) * 100);
  const neuPct = Math.round((neutral / total) * 100);
  const negPct = 100 - posPct - neuPct;

  return (
    <div className="w-full space-y-1.5">
      <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5">
        <div
          style={{ width: `${posPct}%` }}
          className="bg-emerald-500 rounded-l-full transition-all duration-500 relative group"
          title={`Positive: ${posPct}%`}
        />
        <div
          style={{ width: `${neuPct}%` }}
          className="bg-amber-400 transition-all duration-500 relative group"
          title={`Neutral: ${neuPct}%`}
        />
        <div
          style={{ width: `${negPct}%` }}
          className="bg-rose-500 rounded-r-full transition-all duration-500 relative group"
          title={`Negative: ${negPct}%`}
        />
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Pos: {posPct}%
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Neu: {neuPct}%
          </span>
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Neg: {negPct}%
          </span>
        </div>
      )}
    </div>
  );
}

// 4. Emotion Spectrum Horizontal Bars
export function EmotionBars({
  emotions
}: {
  emotions: {
    joyOptimism: number;
    trustConfidence: number;
    skepticismCaution: number;
    concernFear: number;
    frustrationAnger: number;
    neutrality: number;
  };
}) {
  const items = [
    { label: 'Joy & Optimism', value: emotions.joyOptimism || 0, color: 'bg-emerald-500', barBg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Trust & Confidence', value: emotions.trustConfidence || 0, color: 'bg-blue-500', barBg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Neutral Objectivity', value: emotions.neutrality || 0, color: 'bg-slate-400', barBg: 'bg-slate-100', text: 'text-slate-600' },
    { label: 'Skepticism & Caution', value: emotions.skepticismCaution || 0, color: 'bg-amber-500', barBg: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Concern & Fear', value: emotions.concernFear || 0, color: 'bg-orange-500', barBg: 'bg-orange-50', text: 'text-orange-700' },
    { label: 'Frustration / Anger', value: emotions.frustrationAnger || 0, color: 'bg-rose-500', barBg: 'bg-rose-50', text: 'text-rose-700' },
  ];

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className={`font-mono font-semibold ${item.text}`}>{Math.round(item.value)}%</span>
          </div>
          <div className={`h-2 w-full ${item.barBg} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
