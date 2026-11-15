import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, Download, Globe, MapPin,
  TrendingUp, TrendingDown, Layers, BarChart3, ChevronRight, X
} from 'lucide-react';
import { getDataset, getClusterProfiles, runClustering } from '../services/api.js';
import ClusterBadge, { CLUSTER_CHART_COLORS } from '../components/ClusterBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function RegionalExplorer() {
  const [records, setRecords] = useState([]);
  const [clusters, setClusters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [sortField, setSortField] = useState('basic_water_access_pct');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected region detail modal
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch cluster profiles first (or run default if needed)
    getClusterProfiles()
      .then((res) => {
        setClusters(res.cluster_profiles || {});
        if (res.enriched_records && res.enriched_records.length > 0) {
          setRecords(res.enriched_records);
        } else {
          // If no enriched records, fetch raw dataset
          return getDataset().then((ds) => {
            setRecords(ds.preview || []);
          });
        }
      })
      .catch((err) => {
        // Fallback: run clustering to get records
        return runClustering(3)
          .then((res) => {
            setClusters(res.cluster_profiles || {});
            setRecords(res.enriched_records || []);
          })
          .catch((e) => setError(e.message));
      })
      .finally(() => setLoading(false));
  }, []);

  // Unique regions list
  const regionOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.region) set.add(r.region);
    });
    return Array.from(set).sort();
  }, [records]);

  // Unique cluster list
  const clusterOptions = useMemo(() => {
    return Object.values(clusters).map((c) => ({
      id: c.cluster_id,
      name: c.cluster_name,
    }));
  }, [clusters]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch =
          r.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.region?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion =
          selectedRegion === 'ALL' || r.region === selectedRegion;
        const matchesCluster =
          selectedCluster === 'ALL' || String(r.cluster) === String(selectedCluster);
        return matchesSearch && matchesRegion && matchesCluster;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        valA = Number(valA ?? 0);
        valB = Number(valB ?? 0);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [records, searchTerm, selectedRegion, selectedCluster, sortField, sortOrder]);

  // Summary Metrics for current filtered view
  const summary = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    const avgWater =
      filteredRecords.reduce((sum, r) => sum + (Number(r.basic_water_access_pct) || 0), 0) /
      filteredRecords.length;
    const avgSanitation =
      filteredRecords.reduce((sum, r) => sum + (Number(r.sanitation_access_pct) || 0), 0) /
      filteredRecords.length;
    const highest = [...filteredRecords].sort(
      (a, b) => Number(b.basic_water_access_pct || 0) - Number(a.basic_water_access_pct || 0)
    )[0];
    const lowest = [...filteredRecords].sort(
      (a, b) => Number(a.basic_water_access_pct || 0) - Number(b.basic_water_access_pct || 0)
    )[0];

    return {
      count: filteredRecords.length,
      avgWater: avgWater.toFixed(1),
      avgSanitation: avgSanitation.toFixed(1),
      highest: highest ? { name: highest.country, val: highest.basic_water_access_pct } : null,
      lowest: lowest ? { name: lowest.country, val: lowest.basic_water_access_pct } : null,
    };
  }, [filteredRecords]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'country',
      'region',
      'cluster',
      'cluster_name',
      'basic_water_access_pct',
      'safely_managed_water_pct',
      'rural_water_access_pct',
      'urban_water_access_pct',
      'sanitation_access_pct',
      'hygiene_availability_pct',
    ];
    const csvRows = [headers.join(',')];
    filteredRecords.forEach((r) => {
      const row = headers.map((h) => {
        const val = r[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquascope_regional_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regional WASH Explorer</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Search, filter, compare, and inspect survey indicators across {records.length} global regions.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="btn-outline self-start sm:self-auto text-sm"
        >
          <Download className="w-4 h-4 text-aqua" />
          Export Filtered CSV ({filteredRecords.length})
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Filtered Regions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{summary.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">out of {records.length} in dataset</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Water Access</p>
            <p className="text-2xl font-bold text-aqua mt-1">{summary.avgWater}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Basic drinking service</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Highest Access</p>
            <p className="text-lg font-bold text-teal mt-1 truncate" title={summary.highest?.name}>
              {summary.highest?.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{summary.highest?.val}% basic water</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vulnerable Outlier</p>
            <p className="text-lg font-bold text-rose-500 mt-1 truncate" title={summary.lowest?.name}>
              {summary.lowest?.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{summary.lowest?.val}% basic water</p>
          </div>
        </div>
      )}

      {/* Lightweight Geographic Macro-Region Visualizer (No external paid APIs) */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-aqua" /> Macro-Region Distribution
          </h2>
          <span className="text-xs text-slate-400">Click a region card to filter</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {regionOptions.map((reg) => {
            const regCount = records.filter((r) => r.region === reg).length;
            const regAvg = (
              records
                .filter((r) => r.region === reg)
                .reduce((s, r) => s + (Number(r.basic_water_access_pct) || 0), 0) / (regCount || 1)
            ).toFixed(1);
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(isSelected ? 'ALL' : reg)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-aqua bg-aqua/10 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <p className="text-xs font-semibold text-slate-700">{reg}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{regAvg}%</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{regCount} countries</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country or continent…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-9 text-sm w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                className="form-input text-xs py-2"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="ALL">All Macro-Regions</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Cluster Filter */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <select
                className="form-input text-xs py-2"
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
              >
                <option value="ALL">All Clusters</option>
                {clusterOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cluster {c.id}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedRegion !== 'ALL' || selectedCluster !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedRegion('ALL');
                  setSelectedCluster('ALL');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <LoadingSpinner message="Loading regional survey data…" />}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          Failed to load regional data: {error}
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('country')}
                  >
                    <div className="flex items-center gap-1.5">
                      Country <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Macro-Region</th>
                  <th className="p-3.5">Cluster Profile</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 text-right"
                    onClick={() => toggleSort('basic_water_access_pct')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Basic Water % <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 text-right"
                    onClick={() => toggleSort('safely_managed_water_pct')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Safely Managed % <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 text-right"
                    onClick={() => toggleSort('sanitation_access_pct')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Sanitation % <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 text-right"
                    onClick={() => toggleSort('hygiene_availability_pct')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Hygiene % <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                      No regions match your current filter and search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => {
                    const waterVal = Number(r.basic_water_access_pct ?? 0);
                    return (
                      <tr
                        key={r.country || i}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedCountry(r)}
                      >
                        <td className="p-3.5 font-semibold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {r.country}
                        </td>
                        <td className="p-3.5 text-slate-600 text-xs">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {r.region || 'Global'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <ClusterBadge
                            clusterName={r.cluster_name || `Cluster ${r.cluster ?? 0}`}
                            clusterNumber={r.cluster ?? 0}
                          />
                        </td>
                        <td className="p-3.5 text-right font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-800">{waterVal.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  waterVal >= 85
                                    ? 'bg-teal'
                                    : waterVal >= 60
                                    ? 'bg-aqua'
                                    : waterVal >= 40
                                    ? 'bg-amber-400'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, waterVal)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-right text-slate-600">
                          {r.safely_managed_water_pct != null
                            ? `${Number(r.safely_managed_water_pct).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="p-3.5 text-right text-slate-600">
                          {r.sanitation_access_pct != null
                            ? `${Number(r.sanitation_access_pct).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="p-3.5 text-right text-slate-600">
                          {r.hygiene_availability_pct != null
                            ? `${Number(r.hygiene_availability_pct).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCountry(r);
                            }}
                            className="text-xs text-aqua hover:text-aqua-dark font-medium flex items-center justify-center gap-1 mx-auto"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-aqua" />
                  {selectedCountry.country}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Region: {selectedCountry.region || '—'} · Recorded Year: {selectedCountry.year || 2020}
                </p>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Assigned Cluster</span>
                <ClusterBadge
                  clusterName={selectedCountry.cluster_name || `Cluster ${selectedCountry.cluster ?? 0}`}
                  clusterNumber={selectedCountry.cluster ?? 0}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                  <p className="text-slate-500">Basic Drinking Water</p>
                  <p className="text-lg font-bold text-sky-700 mt-0.5">
                    {selectedCountry.basic_water_access_pct ?? '—'}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100">
                  <p className="text-slate-500">Safely Managed Water</p>
                  <p className="text-lg font-bold text-teal mt-0.5">
                    {selectedCountry.safely_managed_water_pct ?? '—'}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100">
                  <p className="text-slate-500">Sanitation Access</p>
                  <p className="text-lg font-bold text-violet-700 mt-0.5">
                    {selectedCountry.sanitation_access_pct ?? '—'}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-slate-500">Hygiene Facilities</p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">
                    {selectedCountry.hygiene_availability_pct ?? '—'}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500">Urban Coverage</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {selectedCountry.urban_water_access_pct ?? '—'}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500">Rural Coverage</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {selectedCountry.rural_water_access_pct ?? '—'}%
                  </p>
                </div>
              </div>

              {selectedCountry.urban_water_access_pct && selectedCountry.rural_water_access_pct && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Rural-Urban Disparity Gap</span>
                    <span className="font-semibold text-slate-800">
                      {(
                        Number(selectedCountry.urban_water_access_pct) -
                        Number(selectedCountry.rural_water_access_pct)
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(selectedCountry.urban_water_access_pct) -
                            Number(selectedCountry.rural_water_access_pct)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedCountry(null)} className="btn-primary text-xs py-2 px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
