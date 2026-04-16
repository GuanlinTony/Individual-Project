"use client";

import { useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BandwidthChart — a small live sparkline of "Mbps" throughput.
// The actual number is synthesized from a random walk centered around a
// rolling baseline, so the chart feels alive without being chaotic.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_COUNT = 40;
const SAMPLE_MS = 500;

export default function BandwidthChart() {
  const [samples, setSamples] = useState<number[]>(() =>
    Array.from({ length: SAMPLE_COUNT }, () => 28 + Math.random() * 14),
  );
  const baselineRef = useRef(32);

  useEffect(() => {
    const iv = setInterval(() => {
      // Drift the baseline slowly so the chart tells a story
      baselineRef.current += (Math.random() - 0.5) * 2;
      baselineRef.current = Math.max(18, Math.min(52, baselineRef.current));
      const next = baselineRef.current + (Math.random() - 0.5) * 8;
      setSamples((prev) => [...prev.slice(1), Math.max(8, Math.min(60, next))]);
    }, SAMPLE_MS);
    return () => clearInterval(iv);
  }, []);

  const current = samples[samples.length - 1];
  const max = 60;
  const width = 220;
  const height = 60;

  // Build smooth polyline path
  const points = samples.map((s, i) => {
    const x = (i / (SAMPLE_COUNT - 1)) * width;
    const y = height - (s / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const areaPath = `M0,${height} L${points.split(" ").join(" L")} L${width},${height} Z`;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-ink-muted">
          <Activity className="w-3 h-3 text-teal" />
          Bandwidth
        </div>
        <div className="text-lg font-bold font-mono text-teal tabular-nums">
          {current.toFixed(1)}
          <span className="text-[10px] ml-0.5 text-ink-dim">Mbps</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
        <defs>
          <linearGradient id="bw-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#bw-grad)" />
        <polyline
          points={points}
          fill="none"
          stroke="#22D3EE"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
