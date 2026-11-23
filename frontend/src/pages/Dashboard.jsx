import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Globe2, Droplets, FlaskConical, Users, Database, AlertCircle,
  RefreshCw, TrendingUp, TrendingDown, Layers, Filter, HelpCircle,
  Scale, X, Sparkles, BookOpen, ChevronRight, CheckCircle2, AlertTriangle
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import DataInsights from '../components/DataInsights.jsx';
import CountryDetailPanel from '../components/CountryDetailPanel.jsx';
import CountryComparisonModal from '../components/CountryComparisonModal.jsx';
import { getDashboard } from '../services/api.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
      <p className="font-bold text-cyan-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} style={{ color: p.color || '#38bdf8' }} className="flex justify-between gap-4 py-0.5">
          <span>{p.name}:</span>
          <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%</strong>
        </p>
      ))}
    </div>
  );
}

const PIE_COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444'];

const INDICATOR_DEFINITIONS = [
  {
    name: 'Basic Drinking Water Access',
    col: 'basic_water_access_pct',
    definition: 'Drinking water from an improved source (piped water, protected well, borehole) provided collection time is not more than 30 minutes roundtrip.',
    tier: 'Target: 100% by 2030 (SDG 6.1)',
    badge: 'Core Service',
    color: 'border-cyan-500/40 bg-cyan-900/20 text-cyan-300'
  },
  {
    name: 'Safely Managed Drinking Water',
    col: 'safely_managed_water_pct',
    definition: 'Water from an improved water source located on premises, available when needed, and completely free from fecal and chemical contamination.',
    tier: 'Highest Standard (WHO/UNICEF)',
    badge: 'Safely Managed',
    color: 'border-emerald-500/40 bg-emerald-900/20 text-emerald-300'
  },
  {
    name: 'Unimproved Water Source Reliance',
    col: 'unimproved_water_pct',
    definition: 'Water collected from unprotected dug wells, unprotected springs, or vendor trucks without quality safeguards.',
    tier: 'Hazard Level: Moderate-High',
    badge: 'Hazard Metric',
    color: 'border-amber-500/40 bg-amber-900/20 text-amber-300'
  },
  {
    name: 'Direct Surface Water Reliance',
    col: 'surface_water_pct',
    definition: 'Drinking directly from untreated surface water bodies such as rivers, dams, lakes, irrigation canals, or rainwater catchments.',
    tier: 'Critical Water Vulnerability',
    badge: 'Critical Outlier',
    color: 'border-rose-500/40 bg-rose-900/20 text-rose-300'
  },
  {
    name: 'Rural Water Access',
    col: 'rural_water_access_pct',
    definition: 'Percentage of rural populations with access to at least basic drinking water. Reveals regional infrastructure imbalances.',
    tier: 'Equity Indicator',
    badge: 'Equity Divide',
    color: 'border-teal-500/40 bg-teal-900/20 text-teal-300'
  },
  {
    name: 'Urban Water Access',
    col: 'urban_water_access_pct',
    definition: 'Percentage of urban populations connected to improved water delivery grids.',
    tier: 'Infrastructure Benchmark',
    badge: 'Urban Grid',
    color: 'border-blue-500/40 bg-blue-900/20 text-blue-300'
  },
  {
    name: 'Sanitation Service Access',
    col: 'sanitation_access_pct',
    definition: 'Use of improved sanitation facilities that are not shared with other households (flush toilets, ventilated improved pit latrines).',
    tier: 'Target: SDG 6.2',
    badge: 'Sanitation',
    color: 'border-violet-500/40 bg-violet-900/20 text-violet-300'
  },
  {
    name: 'Hygiene Service Availability',
    col: 'hygiene_availability_pct',
    definition: 'Availability of a designated handwashing facility on premises with both clean water and soap.',
    tier: 'Public Health Benchmark',
    badge: 'Hygiene',
    color: 'border-sky-500/40 bg-sky-900/20 text-sky-300'
  }
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Interactive filters
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [sortIndicator, setSortIndicator] = useState('basic_water_access_pct');

  // Modals & Drawers
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonInitial, setComparisonInitial] = useState([]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getDashboard({
      region: selectedRegion,
      year: selectedYear,
      indicator: sortIndicator,
    })
      .then((d) => {
        setData(d);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [selectedRegion, selectedYear, sortIndicator]);

  // Top regions by selected indicator
  const topRegionsChartData = useMemo(() => {
    if (!data?.top_regions) return [];
    return data.top_regions.slice(0, 10).map((r) => {
      const val = Number(r[sortIndicator] ?? 0);
      return {
        name: r.country?.length > 14 ? r.country.slice(0, 13) + '…' : r.country,
        fullName: r.country,
        value: parseFloat(val.toFixed(1)),
        countryRecord: r,
      };
    });
  }, [data, sortIndicator]);

  // Urban vs Rural access for top regions
  const urbanRural = useMemo(() => {
    if (!data?.top_regions) return [];
    return data.top_regions.slice(0, 10).map((r) => ({
      name: r.country?.length > 12 ? r.country.slice(0, 11) + '…' : r.country,
      Urban: parseFloat((r.urban_water_access_pct ?? 0).toFixed(1)),
      Rural: parseFloat((r.rural_water_access_pct ?? 0).toFixed(1)),
      countryRecord: r,
    }));
  }, [data]);

  // Macro-Regional breakdown
  const regionalData = useMemo(() => {
    if (!data?.regional_breakdown) return [];
    return data.regional_breakdown.map((reg) => ({
      name: reg.region,
      'Basic Water': reg.avg_water,
      'Sanitation': reg.avg_sanitation,
      'Hygiene': reg.avg_hygiene,
    }));
  }, [data]);

  // Service Level Pie Breakdown
  const pieData = useMemo(() => {
    if (!data) return [];
    const safely = parseFloat((data.avg_safely_managed_water ?? 0).toFixed(1));
    const basic = parseFloat(Math.max(0, (data.avg_basic_water_access ?? 0) - (data.avg_safely_managed_water ?? 0)).toFixed(1));
    const unimproved = parseFloat((data.avg_unimproved_water ?? 0).toFixed(1));
    const surface = parseFloat((data.avg_surface_water ?? 0).toFixed(1));
    return [
      { name: 'Safely Managed', value: safely },
      { name: 'Basic (Unmanaged)', value: basic },
      { name: 'Unimproved Sources', value: unimproved },
      { name: 'Direct Surface Water', value: surface },
    ];
  }, [data]);

  const handleCountryClick = (country) => {
    if (country) {
      setSelectedCountry(country);
    }
  };

  const handleOpenComparison = (country) => {
    if (country) {
      setComparisonInitial([country]);
    }
    setIsComparisonOpen(true);
  };

  // Indicator Label Map
  const indicatorLabel = useMemo(() => {
    const found = INDICATOR_DEFINITIONS.find((i) => i.col === sortIndicator);
    return found ? found.name : 'Basic Water Access';
  }, [sortIndicator]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-600">
              UN JMP Open Survey Indicators
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Regional Water Intelligence Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Interactive multi-indicator analytics, automated equity insights, and cross-national WASH profiles.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            Indicator Glossary
          </button>

          <button
            onClick={() => handleOpenComparison(null)}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-600" />
            Compare Countries
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="card p-4 bg-slate-50 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-cyan-600" />
            <span>Active Dashboard Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 md:max-w-2xl">
            {/* Macro-Region Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Macro-Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="form-input text-xs py-1.5 w-full bg-white font-medium"
              >
                <option value="ALL">All Macro-Regions (Global)</option>
                <option value="Africa">Africa</option>
                <option value="Americas">Americas</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            {/* Survey Year Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Survey Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-input text-xs py-1.5 w-full bg-white font-medium"
              >
                <option value="ALL">All Survey Years</option>
                <option value="2020">2020 Benchmark</option>
                <option value="2021">2021 Survey Cycle</option>
              </select>
            </div>

            {/* Sort Indicator Focus */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Indicator Focus
              </label>
              <select
                value={sortIndicator}
                onChange={(e) => setSortIndicator(e.target.value)}
                className="form-input text-xs py-1.5 w-full bg-white font-medium"
              >
                <option value="basic_water_access_pct">Basic Water Access</option>
                <option value="safely_managed_water_pct">Safely Managed Water</option>
                <option value="rural_water_access_pct">Rural Water Access</option>
                <option value="urban_water_access_pct">Urban Water Access</option>
                <option value="sanitation_access_pct">Sanitation Access</option>
                <option value="hygiene_availability_pct">Hygiene Facilities</option>
                <option value="unimproved_water_pct">Unimproved Reliance</option>
                <option value="surface_water_pct">Surface Water Reliance</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedRegion !== 'ALL' || selectedYear !== 'ALL' || sortIndicator !== 'basic_water_access_pct') && (
            <button
              onClick={() => {
                setSelectedRegion('ALL');
                setSelectedYear('ALL');
                setSortIndicator('basic_water_access_pct');
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 self-start md:self-center"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-700 font-semibold text-sm">Backend Service Offline</p>
            <p className="text-rose-500 text-xs mt-0.5">{error}. Ensure the Flask backend is active.</p>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Aggregating WASH survey indicators and computing regional metrics…" />}

      {!loading && !error && data && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Regions Surveyed"
              value={data.total_regions}
              icon={<Globe2 className="w-5 h-5" />}
              color="aqua"
            />
            <StatCard
              title="Avg Basic Water"
              value={data.avg_basic_water_access?.toFixed(1)}
              unit="%"
              icon={<Droplets className="w-5 h-5" />}
              color="teal"
            />
            <StatCard
              title="Safely Managed"
              value={data.avg_safely_managed_water?.toFixed(1)}
              unit="%"
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Avg Sanitation"
              value={data.avg_sanitation_access?.toFixed(1)}
              unit="%"
              icon={<FlaskConical className="w-5 h-5" />}
              color="violet"
            />
            <StatCard
              title="Avg Hygiene"
              value={data.avg_hygiene_availability?.toFixed(1)}
              unit="%"
              icon={<Users className="w-5 h-5" />}
              color="amber"
            />
            <StatCard
              title="Surface Reliance"
              value={data.avg_surface_water?.toFixed(1)}
              unit="%"
              icon={<AlertTriangle className="w-5 h-5" />}
              color="rose"
            />
          </div>

          {/* Section: Meaningful Automated Data Insights */}
          <DataInsights
            records={data.all_records || data.top_regions || []}
            onSelectCountry={(c) => handleCountryClick(c)}
          />

          {/* Charts Row 1: Top Regions & Urban vs Rural */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top Regions by Selected Indicator */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title">Top Regions — {indicatorLabel}</h2>
                  <p className="text-xs text-slate-400">
                    Highest ranked surveyed countries ({selectedRegion === 'ALL' ? 'Global' : selectedRegion})
                  </p>
                </div>
                <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full font-medium">
                  {sortIndicator.replace(/_/g, ' ')}
                </span>
              </div>

              {topRegionsChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No data matching active filter criteria.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={topRegionsChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, cursor: 'pointer' }}
                      onClick={(e) => {
                        const target = topRegionsChartData.find((r) => r.name === e?.value);
                        if (target?.countryRecord) handleCountryClick(target.countryRecord);
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name={indicatorLabel}
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                      onClick={(barData) => {
                        if (barData?.countryRecord) handleCountryClick(barData.countryRecord);
                      }}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Urban vs Rural Access Disparity */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title">Urban vs. Rural Equity Disparity</h2>
                  <p className="text-xs text-slate-400">
                    Direct comparison of municipal water coverage vs. rural village infrastructure
                  </p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                  SDG 6 Infrastructure Gap
                </span>
              </div>

              {urbanRural.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No data matching active filter criteria.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={urbanRural}
                    margin={{ top: 0, right: 10, left: 0, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={28} />
                    <Bar dataKey="Urban" fill="#0ea5e9" radius={[3, 3, 0, 0]} cursor="pointer" />
                    <Bar dataKey="Rural" fill="#14b8a6" radius={[3, 3, 0, 0]} cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts Row 2: Continental Averages & Water Service Ladder */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Macro-Region Comparison */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title">Macro-Region Multi-Indicator Breakdown</h2>
                  <p className="text-xs text-slate-400">Continental benchmarks across basic water, sanitation, and hygiene</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={regionalData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} />
                  <Bar dataKey="Basic Water" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Sanitation" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Hygiene" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Drinking Water Ladder Pie Chart */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="section-title">Global Drinking Water Service Ladder</h2>
                  <p className="text-xs text-slate-400">UN JMP hierarchy of drinking water accessibility</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                <ResponsiveContainer width="100%" height={250} className="sm:max-w-xs">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={52}
                      dataKey="value"
                      label={({ value }) => `${value}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 gap-2 w-full sm:max-w-xs text-xs">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-600 font-medium">{d.name}</span>
                      <span className="ml-auto font-bold text-slate-800">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Country Detail Drawer Panel */}
      <CountryDetailPanel
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onAddToComparison={(c) => handleOpenComparison(c)}
        globalAverages={{
          avg_basic_water_access: data?.avg_basic_water_access,
          avg_safely_managed_water: data?.avg_safely_managed_water,
        }}
      />

      {/* Country Comparison Modal */}
      <CountryComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        allCountries={data?.all_records || []}
        initialSelected={comparisonInitial}
      />

      {/* Indicator Glossary & UN JMP Definitions Modal */}
      {isGlossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  UN JMP Indicator Glossary & WASH Standards
                </h3>
              </div>
              <button
                onClick={() => setIsGlossaryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-600 text-sm leading-relaxed">
                AquaScope utilizes survey indicators defined by the <strong>WHO/UNICEF Joint Monitoring Programme (JMP)</strong> for Water Supply, Sanitation, and Hygiene. Below is the operational definition and significance of each surveyed feature:
              </p>

              <div className="space-y-3">
                {INDICATOR_DEFINITIONS.map((item) => (
                  <div key={item.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.color}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.definition}</p>
                    <p className="mt-1.5 text-[11px] font-medium text-cyan-700">{item.tier}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsGlossaryOpen(false)}
                className="btn-primary text-xs py-2 px-5"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
