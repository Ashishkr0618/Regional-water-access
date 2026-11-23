import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  Droplets,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function DataInsights({ records = [], onSelectCountry }) {
  const insights = useMemo(() => {
    if (!records || records.length === 0) return null;

    // 1. Critical Water Shortages (Lowest Basic Access)
    const sortedByBasic = [...records].sort(
      (a, b) => Number(a.basic_water_access_pct ?? 0) - Number(b.basic_water_access_pct ?? 0)
    );
    const criticalNations = sortedByBasic.slice(0, 3);
    const avgCritical = (
      criticalNations.reduce((sum, r) => sum + Number(r.basic_water_access_pct ?? 0), 0) / 3
    ).toFixed(1);

    // 2. Widest Rural-Urban Divide (Urban - Rural)
    const withDividends = records
      .map((r) => {
        const u = Number(r.urban_water_access_pct ?? 0);
        const ru = Number(r.rural_water_access_pct ?? 0);
        return { ...r, divide: u - ru };
      })
      .sort((a, b) => b.divide - a.divide);
    const highestDivideNations = withDividends.slice(0, 3);

    // 3. The "Safety Deficit" (Basic Access - Safely Managed Access)
    // Indicates where water access exists nearby, but water is NOT treated/pathogen-free
    const withDeficits = records
      .filter((r) => Number(r.basic_water_access_pct ?? 0) >= 60)
      .map((r) => {
        const b = Number(r.basic_water_access_pct ?? 0);
        const s = Number(r.safely_managed_water_pct ?? 0);
        return { ...r, safetyDeficit: b - s };
      })
      .sort((a, b) => b.safetyDeficit - a.safetyDeficit);
    const topDeficitNations = withDeficits.slice(0, 3);

    // 4. Surface Water Dependency Hotspots
    const sortedBySurface = [...records].sort(
      (a, b) => Number(b.surface_water_pct ?? 0) - Number(a.surface_water_pct ?? 0)
    );
    const surfaceHotspots = sortedBySurface.slice(0, 3);

    return {
      criticalNations,
      avgCritical,
      highestDivideNations,
      topDeficitNations,
      surfaceHotspots,
    };
  }, [records]);

  if (!insights) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Automated Data-Driven Insights
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">
          Dynamically derived from {records.length} surveyed nations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Insight 1: Critical Shortages */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Critical Access Deficits
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Avg {insights.avgCritical}%
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Severe infrastructure collapse where more than 70% of households lack improved drinking water sources:
          </p>

          <div className="space-y-1 text-xs">
            {insights.criticalNations.map((c) => (
              <button
                key={c.country}
                onClick={() => onSelectCountry?.(c)}
                className="w-full flex items-center justify-between p-1.5 rounded bg-slate-900/60 hover:bg-slate-900 text-left transition"
              >
                <span className="text-white font-medium">{c.country}</span>
                <span className="text-rose-400 font-bold">{c.basic_water_access_pct}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insight 2: Rural-Urban Divide */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Widest Rural Divide
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              &gt;40% Gap
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Nations where capital cities possess high municipal coverage while surrounding rural farming communities lag:
          </p>

          <div className="space-y-1 text-xs">
            {insights.highestDivideNations.map((c) => (
              <button
                key={c.country}
                onClick={() => onSelectCountry?.(c)}
                className="w-full flex items-center justify-between p-1.5 rounded bg-slate-900/60 hover:bg-slate-900 text-left transition"
              >
                <span className="text-white font-medium">{c.country}</span>
                <span className="text-amber-400 font-bold">+{c.divide.toFixed(1)}% Gap</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insight 3: The Safety Deficit Gap */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              The "Safety Deficit"
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Untreated Piped
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            High basic access but low safely managed water — indicating water is piped but intermittently treated:
          </p>

          <div className="space-y-1 text-xs">
            {insights.topDeficitNations.map((c) => (
              <button
                key={c.country}
                onClick={() => onSelectCountry?.(c)}
                className="w-full flex items-center justify-between p-1.5 rounded bg-slate-900/60 hover:bg-slate-900 text-left transition"
              >
                <span className="text-white font-medium">{c.country}</span>
                <span className="text-cyan-400 font-bold">-{c.safetyDeficit.toFixed(1)}% Disparity</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insight 4: Surface Water Reliance */}
        <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
              Surface Water Hotspots
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Direct River
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Populations relying directly on untreated rivers and irrigation canals, exposing them to acute waterborne risk:
          </p>

          <div className="space-y-1 text-xs">
            {insights.surfaceHotspots.map((c) => (
              <button
                key={c.country}
                onClick={() => onSelectCountry?.(c)}
                className="w-full flex items-center justify-between p-1.5 rounded bg-slate-900/60 hover:bg-slate-900 text-left transition"
              >
                <span className="text-white font-medium">{c.country}</span>
                <span className="text-violet-400 font-bold">{c.surface_water_pct}% Reliance</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
