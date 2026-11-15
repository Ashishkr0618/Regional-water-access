import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Globe2, Droplets, FlaskConical, Users, Database, AlertCircle,
  RefreshCw, TrendingUp, TrendingDown, Layers
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { getDashboard } from '../services/api.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%</strong>
        </p>
      ))}
    </div>
  );
}

const PIE_COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#22c55e'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getDashboard()
      .then((d) => {
        setData(d);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Top 10 regions by basic water access
  const top10Regions = data?.top_regions?.slice(0, 10).map((r) => ({
    name: r.country?.length > 14 ? r.country.slice(0, 13) + '…' : r.country,
    'Water Access': parseFloat((r.basic_water_access_pct ?? 0).toFixed(1)),
  })) ?? [];

  // Urban vs Rural access for top regions
  const urbanRural = data?.top_regions?.slice(0, 12).map((r) => ({
    name: r.country?.length > 12 ? r.country.slice(0, 11) + '…' : r.country,
    Urban: parseFloat((r.urban_water_access_pct ?? 0).toFixed(1)),
    Rural: parseFloat((r.rural_water_access_pct ?? 0).toFixed(1)),
  })) ?? [];

  // Regional breakdown
  const regionalData = data?.regional_breakdown?.map((reg) => ({
    name: reg.region,
    'Water Access': reg.avg_water,
    'Sanitation': reg.avg_sanitation,
    'Hygiene': reg.avg_hygiene,
  })) ?? [];

  // Service Level Pie Breakdown
  const pieData = data
    ? [
        { name: 'Safely Managed', value: parseFloat((data.avg_safely_managed_water ?? 0).toFixed(1)) },
        { name: 'Basic Service', value: parseFloat((Math.max(0, (data.avg_basic_water_access ?? 0) - (data.avg_safely_managed_water ?? 0))).toFixed(1)) },
        { name: 'Unimproved', value: parseFloat((data.avg_unimproved_water ?? 0).toFixed(1)) },
        { name: 'Surface Water', value: parseFloat((data.avg_surface_water ?? 0).toFixed(1)) },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regional Water Intelligence Dashboard</h1>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-0.5">Live WASH indicators — Last updated at {lastUpdated}</p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
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

      {loading && <LoadingSpinner message="Aggregating WASH survey indicators…" />}

      {!loading && !error && data && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Regions Analyzed"
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
              title="Dataset Records"
              value={data.dataset_records}
              icon={<Database className="w-5 h-5" />}
              color="green"
            />
          </div>

          {/* Charts Row 1: Top Regions & Urban vs Rural */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top 10 by Water Access */}
            <div className="card p-5">
              <h2 className="section-title">Top 10 Regions — Basic Water Access Coverage</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={top10Regions}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Water Access" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Urban vs Rural Access Disparity */}
            <div className="card p-5">
              <h2 className="section-title">Urban vs. Rural Disparity Comparison</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={urbanRural}
                  margin={{ top: 0, right: 10, left: 0, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} />
                  <Bar dataKey="Urban" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Rural" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Continental Averages & Water Service Ladder */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Macro-Region Comparison */}
            <div className="card p-5">
              <h2 className="section-title">Continental Macro-Region Averages</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={regionalData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} />
                  <Bar dataKey="Water Access" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Sanitation" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Hygiene" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Drinking Water Ladder Pie Chart */}
            <div className="card p-5">
              <h2 className="section-title">Global Drinking Water Service Ladder</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={260} className="sm:max-w-xs">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 gap-2.5 w-full sm:max-w-xs text-xs">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
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
    </div>
  );
}
