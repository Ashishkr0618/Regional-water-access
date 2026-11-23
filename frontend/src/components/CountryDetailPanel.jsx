import React from 'react';
import {
  MapPin,
  X,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import ClusterBadge from './ClusterBadge.jsx';

export default function CountryDetailPanel({
  country,
  onClose,
  onAddToComparison,
  globalAverages = {},
}) {
  if (!country) return null;

  const basicWater = Number(country.basic_water_access_pct ?? 0);
  const safelyManaged = Number(country.safely_managed_water_pct ?? 0);
  const urbanWater = Number(country.urban_water_access_pct ?? 0);
  const ruralWater = Number(country.rural_water_access_pct ?? 0);
  const sanitation = Number(country.sanitation_access_pct ?? 0);
  const hygiene = Number(country.hygiene_availability_pct ?? 0);
  const unimproved = Number(country.unimproved_water_pct ?? 0);
  const surfaceWater = Number(country.surface_water_pct ?? 0);

  // Derived metrics
  const ruralUrbanGap = Math.max(0, urbanWater - ruralWater);
  const safelyManagedDeficit = Math.max(0, basicWater - safelyManaged);

  // Global delta
  const globalWaterAvg = globalAverages.avg_basic_water_access || 75.0;
  const deltaVsGlobal = (basicWater - globalWaterAvg).toFixed(1);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out text-white">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              Country Profile & WASH Analytics
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            {country.country}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>Macro-Region: <strong className="text-slate-200">{country.region || 'Global'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Year: <strong className="text-slate-200">{country.year || 2020}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Cluster Assignment Badge & Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Assigned Unsupervised Cluster
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">
              {country.cluster_name || `Cluster ${country.cluster ?? 0}`}
            </p>
          </div>
          <ClusterBadge
            clusterName={country.cluster_name || `Cluster ${country.cluster ?? 0}`}
            clusterNumber={country.cluster ?? 0}
          />
        </div>

        {/* Global Baseline Benchmark Banner */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-300">Comparison to World Baseline ({globalWaterAvg.toFixed(1)}%):</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              Number(deltaVsGlobal) >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {Number(deltaVsGlobal) >= 0 ? `+${deltaVsGlobal}% above` : `${deltaVsGlobal}% below`}
          </span>
        </div>

        {/* ── SECTION 1: Key Water Indicators ── */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            Drinking Water Service Ladder
          </h3>

          <div className="space-y-2.5">
            {/* Basic Drinking Water */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Basic Drinking Water Access</span>
                <span className="font-extrabold text-cyan-400 text-sm">{basicWater.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, basicWater)}%` }}
                />
              </div>
            </div>

            {/* Safely Managed Water */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Safely Managed Drinking Water</span>
                <span className="font-extrabold text-emerald-400 text-sm">{safelyManaged.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, safelyManaged)}%` }}
                />
              </div>
            </div>

            {/* Unimproved & Surface Water Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
                <span className="text-slate-400 text-[11px] block">Unimproved Sources</span>
                <span className="text-amber-400 font-bold text-base mt-0.5 block">{unimproved.toFixed(1)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
                <span className="text-slate-400 text-[11px] block">Direct Surface Water</span>
                <span className="text-rose-400 font-bold text-base mt-0.5 block">{surfaceWater.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Analytical Disparity Metrics ── */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Infrastructure Inequality Gaps
          </h3>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Rural-Urban Disparity */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Urban vs Rural Coverage Gap</span>
                <span className="font-bold text-amber-400">{ruralUrbanGap.toFixed(1)}% Gap</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Urban Coverage:</span>
                  <strong className="text-white text-xs">{urbanWater.toFixed(1)}%</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Rural Coverage:</span>
                  <strong className="text-white text-xs">{ruralWater.toFixed(1)}%</strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                {ruralUrbanGap > 30
                  ? '⚠️ Critical infrastructure inequality between city centers and rural communities.'
                  : ruralUrbanGap > 15
                  ? 'Moderate divide requiring targeted rural infrastructure investments.'
                  : 'Equitable urban and rural coverage balance.'}
              </p>
            </div>

            {/* Safety Deficit */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">The "Safety Deficit" Gap</span>
                <span className="font-bold text-cyan-400">{safelyManagedDeficit.toFixed(1)}% Deficit</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Difference between basic access and safely managed water. A high gap indicates piped infrastructure exists nearby but lacks verified disinfection or continuous pressure.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Sanitation & Hygiene ── */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Sanitation & Hygiene Services
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
              <span className="text-slate-400 text-[11px] block">Basic Sanitation</span>
              <span className="text-teal-400 font-extrabold text-lg mt-0.5 block">{sanitation.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-500 block">Improved toilet facilities</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
              <span className="text-slate-400 text-[11px] block">Hygiene Availability</span>
              <span className="text-violet-400 font-extrabold text-lg mt-0.5 block">{hygiene.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-500 block">Soap & water handwashing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
        {onAddToComparison && (
          <button
            onClick={() => {
              onAddToComparison(country);
            }}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
          >
            <Scale className="w-4 h-4" />
            Compare Country
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
