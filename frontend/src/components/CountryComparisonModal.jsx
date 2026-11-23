import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Droplets,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ClusterBadge from './ClusterBadge.jsx';

const COMPARISON_METRICS = [
  { key: 'basic_water_access_pct', label: 'Basic Drinking Water', higherIsBetter: true },
  { key: 'safely_managed_water_pct', label: 'Safely Managed Water', higherIsBetter: true },
  { key: 'rural_water_access_pct', label: 'Rural Water Access', higherIsBetter: true },
  { key: 'urban_water_access_pct', label: 'Urban Water Access', higherIsBetter: true },
  { key: 'sanitation_access_pct', label: 'Sanitation Access', higherIsBetter: true },
  { key: 'hygiene_availability_pct', label: 'Hygiene Facilities', higherIsBetter: true },
  { key: 'unimproved_water_pct', label: 'Unimproved Reliance', higherIsBetter: false },
  { key: 'surface_water_pct', label: 'Surface Water Reliance', higherIsBetter: false },
];

const COUNTRY_COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6'];

export default function CountryComparisonModal({
  isOpen,
  onClose,
  allCountries = [],
  initialSelected = [],
}) {
  const [selectedCountryNames, setSelectedCountryNames] = useState(
    initialSelected.length > 0 ? initialSelected.map((c) => c.country) : ['India', 'Brazil']
  );
  const [selectorValue, setSelectorValue] = useState('');

  if (!isOpen) return null;

  // Resolve selected records
  const selectedRecords = useMemo(() => {
    return selectedCountryNames
      .map((name) => allCountries.find((c) => c.country?.toLowerCase() === name.toLowerCase()))
      .filter(Boolean);
  }, [selectedCountryNames, allCountries]);

  const handleAddCountry = (name) => {
    if (!name) return;
    if (selectedCountryNames.includes(name)) return;
    if (selectedCountryNames.length >= 3) {
      alert('You can compare up to 3 countries simultaneously for optimal readability.');
      return;
    }
    setSelectedCountryNames([...selectedCountryNames, name]);
    setSelectorValue('');
  };

  const handleRemoveCountry = (name) => {
    setSelectedCountryNames(selectedCountryNames.filter((n) => n !== name));
  };

  // Recharts grouped bar chart data
  const chartData = useMemo(() => {
    return COMPARISON_METRICS.slice(0, 6).map((m) => {
      const item = { metric: m.label };
      selectedRecords.forEach((c) => {
        item[c.country] = Number(c[m.key] ?? 0);
      });
      return item;
    });
  }, [selectedRecords]);

  // Derived narrative insight
  const narrative = useMemo(() => {
    if (selectedRecords.length < 2) return null;
    const [c1, c2] = selectedRecords;
    const diffBasic = (Number(c1.basic_water_access_pct ?? 0) - Number(c2.basic_water_access_pct ?? 0)).toFixed(1);
    const c1RuralGap = Number(c1.urban_water_access_pct ?? 0) - Number(c1.rural_water_access_pct ?? 0);
    const c2RuralGap = Number(c2.urban_water_access_pct ?? 0) - Number(c2.rural_water_access_pct ?? 0);

    const leader = Number(diffBasic) >= 0 ? c1.country : c2.country;
    const margin = Math.abs(Number(diffBasic));

    const gapLeader = c1RuralGap < c2RuralGap ? c1.country : c2.country;

    return `${leader} leads overall basic drinking water access by ${margin}% coverage margin. In terms of rural-urban equity, ${gapLeader} demonstrates a smaller infrastructure disparity gap between its city centers and rural communities.`;
  }, [selectedRecords]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Cross-Country WASH Comparative Analysis</h2>
              <p className="text-xs text-slate-400">
                Compare multi-dimensional water access, sanitation, and infrastructure disparities side-by-side.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Country Selector Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-2">Active Comparison:</span>
              {selectedRecords.map((c, i) => (
                <div
                  key={c.country}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
                  style={{
                    backgroundColor: `${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}15`,
                    borderColor: `${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}50`,
                    color: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
                  }}
                >
                  <span>{c.country}</span>
                  {selectedRecords.length > 1 && (
                    <button
                      onClick={() => handleRemoveCountry(c.country)}
                      className="hover:opacity-75"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Country Dropdown */}
            {selectedRecords.length < 3 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectorValue}
                  onChange={(e) => handleAddCountry(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">+ Add country to compare...</option>
                  {allCountries
                    .filter((c) => !selectedCountryNames.includes(c.country))
                    .map((c) => (
                      <option key={c.country} value={c.country}>
                        {c.country} ({c.region})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Narrative Insight Callout */}
          {narrative && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Automated Comparative Observation:</strong>
                {narrative}
              </div>
            </div>
          )}

          {/* Recharts Grouped Bar Comparison */}
          {selectedRecords.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Service Ladder Comparison (%)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(val) => `${Number(val).toFixed(1)}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {selectedRecords.map((c, i) => (
                    <Bar
                      key={c.country}
                      dataKey={c.country}
                      fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Side-by-Side Detailed Metrics Matrix */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">WASH Indicator</th>
                    {selectedRecords.map((c, i) => (
                      <th
                        key={c.country}
                        className="p-3.5 font-bold"
                        style={{ color: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }}
                      >
                        {c.country}
                      </th>
                    ))}
                    {selectedRecords.length === 2 && <th className="p-3.5 text-right">Advantage Delta</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {/* Cluster row */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-300">Cluster Archetype</td>
                    {selectedRecords.map((c) => (
                      <td key={c.country} className="p-3.5">
                        <ClusterBadge
                          clusterName={c.cluster_name || `Cluster ${c.cluster ?? 0}`}
                          clusterNumber={c.cluster ?? 0}
                        />
                      </td>
                    ))}
                    {selectedRecords.length === 2 && <td className="p-3.5 text-right text-slate-500">—</td>}
                  </tr>

                  {COMPARISON_METRICS.map((m) => {
                    const vals = selectedRecords.map((c) => Number(c[m.key] ?? 0));
                    const bestVal = m.higherIsBetter ? Math.max(...vals) : Math.min(...vals);
                    const delta = selectedRecords.length === 2 ? (vals[0] - vals[1]).toFixed(1) : null;

                    return (
                      <tr key={m.key} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-medium text-slate-300">{m.label}</td>
                        {selectedRecords.map((c, i) => {
                          const val = Number(c[m.key] ?? 0);
                          const isBest = val === bestVal && vals.some((v) => v !== bestVal);
                          return (
                            <td key={c.country} className="p-3.5 font-bold">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${
                                  isBest
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'text-slate-300'
                                }`}
                              >
                                {val.toFixed(1)}%
                                {isBest && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              </span>
                            </td>
                          );
                        })}

                        {selectedRecords.length === 2 && (
                          <td className="p-3.5 text-right font-mono font-bold">
                            <span
                              className={
                                (m.higherIsBetter && Number(delta) >= 0) || (!m.higherIsBetter && Number(delta) <= 0)
                                  ? 'text-cyan-400'
                                  : 'text-amber-400'
                              }
                            >
                              {Number(delta) > 0 ? `+${delta}%` : `${delta}%`}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {/* Rural-Urban Disparity Gap */}
                  <tr className="bg-slate-950/40 font-semibold">
                    <td className="p-3.5 text-amber-400">Rural-Urban Divide (Urban - Rural)</td>
                    {selectedRecords.map((c) => {
                      const gap = Math.max(0, Number(c.urban_water_access_pct ?? 0) - Number(c.rural_water_access_pct ?? 0));
                      return (
                        <td key={c.country} className="p-3.5 text-amber-400 font-bold">
                          {gap.toFixed(1)}% Gap
                        </td>
                      );
                    })}
                    {selectedRecords.length === 2 && (
                      <td className="p-3.5 text-right text-xs text-slate-400">
                        Lower gap = higher equity
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
