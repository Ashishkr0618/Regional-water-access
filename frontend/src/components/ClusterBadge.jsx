import React from 'react';

/**
 * ClusterBadge — colored pill for a cluster label.
 * Props:
 *   clusterName   {string}  — display name (e.g. "High Access")
 *   clusterNumber {number}  — numeric cluster id (0–5) for color mapping
 */
const CLUSTER_COLORS = [
  { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
];

// Colors used in Recharts scatter / bar charts per cluster index
export const CLUSTER_CHART_COLORS = [
  '#0ea5e9', // sky-500
  '#14b8a6', // teal-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // rose-500
  '#22c55e', // green-500
];

export default function ClusterBadge({ clusterName, clusterNumber = 0 }) {
  const idx = typeof clusterNumber === 'number' ? clusterNumber % CLUSTER_COLORS.length : 0;
  const c = CLUSTER_COLORS[idx];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {clusterName ?? `Cluster ${clusterNumber}`}
    </span>
  );
}
