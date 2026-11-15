import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard — displays a key metric with an optional trend indicator.
 *
 * Props:
 *   title    {string}  — label shown above the value
 *   value    {string|number} — main metric value
 *   unit     {string}  — unit suffix (e.g. "%", "regions")
 *   icon     {ReactNode} — lucide icon element
 *   color    {string}  — Tailwind color name used for accent (e.g. "aqua", "teal", "green", "amber", "rose")
 *   change   {number}  — optional percentage change (+/-)
 */
export default function StatCard({ title, value, unit, icon, color = 'aqua', change }) {
  const colorMap = {
    aqua: { bar: 'from-aqua to-aqua/60', text: 'text-aqua', bg: 'bg-aqua/10' },
    teal: { bar: 'from-teal to-teal/60', text: 'text-teal', bg: 'bg-teal/10' },
    green: { bar: 'from-green-500 to-green-300', text: 'text-green-600', bg: 'bg-green-50' },
    amber: { bar: 'from-amber-500 to-amber-300', text: 'text-amber-600', bg: 'bg-amber-50' },
    rose: { bar: 'from-rose-500 to-rose-300', text: 'text-rose-600', bg: 'bg-rose-50' },
    violet: { bar: 'from-violet-500 to-violet-300', text: 'text-violet-600', bg: 'bg-violet-50' },
  };

  const c = colorMap[color] || colorMap.aqua;

  return (
    <div className="card card-hover overflow-hidden">
      {/* Gradient top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${c.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{title}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">
                {value !== undefined && value !== null ? value : '—'}
              </span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>

            {/* Change indicator */}
            {change !== undefined && change !== null && (
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-rose-500'}`}>
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{change >= 0 ? '+' : ''}{change}%</span>
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={`ml-3 w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={c.text}>{icon}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
