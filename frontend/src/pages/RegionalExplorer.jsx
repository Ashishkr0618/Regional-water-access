import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Globe,
  MapPin,
  TrendingUp,
  Layers,
  BarChart3,
  ChevronRight,
  X,
  Map,
  Table as TableIcon,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { getDataset, getClusterProfiles, runClustering } from '../services/api.js';
import ClusterBadge from '../components/ClusterBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import InteractiveWorldMap, { INDICATOR_CONFIGS } from '../components/InteractiveWorldMap.jsx';
import CountryDetailPanel from '../components/CountryDetailPanel.jsx';
import CountryComparisonModal from '../components/CountryComparisonModal.jsx';

export default function RegionalExplorer() {
  const [records, setRecords] = useState([]);
  const [clusters, setClusters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active View: 'map' or 'table'
  const [viewMode, setViewMode] = useState('map');

  // Map active indicator
  const [activeIndicator, setActiveIndicator] = useState('basic_water_access_pct');

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [sortField, setSortField] = useState('basic_water_access_pct');
  const [sortOrder, setSortOrder] = useState('desc');

  // Detail panel state
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Comparison modal state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonInitial, setComparisonInitial] = useState([]);

  useEffect(() => {
    setLoading(true);
    getClusterProfiles()
      .then((res) => {
        setClusters(res.cluster_profiles || {});
        if (res.enriched_records && res.enriched_records.length > 0) {
          setRecords(res.enriched_records);
        } else {
          return getDataset().then((ds) => {
            setRecords(ds.preview || []);
          });
        }
      })
      .catch(() => {
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

  // Unique clusters list
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

  // Global Averages calculation
  const globalAverages = useMemo(() => {
    if (records.length === 0) return {};
    const sumWater = records.reduce((s, r) => s + (Number(r.basic_water_access_pct) || 0), 0);
    const sumSafely = records.reduce((s, r) => s + (Number(r.safely_managed_water_pct) || 0), 0);
    return {
      avg_basic_water_access: sumWater / records.length,
      avg_safely_managed_water: sumSafely / records.length,
    };
  }, [records]);

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
      'year',
      'cluster',
      'cluster_name',
      'basic_water_access_pct',
      'safely_managed_water_pct',
      'rural_water_access_pct',
      'urban_water_access_pct',
      'sanitation_access_pct',
      'hygiene_availability_pct',
      'unimproved_water_pct',
      'surface_water_pct',
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
    a.download = `aquascope_regional_wash_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const handleOpenComparison = (country) => {
    if (country) {
      setComparisonInitial([country]);
    }
    setIsComparisonOpen(true);
  };

  const activeIndicatorConfig = useMemo(() => {
    return (
      INDICATOR_CONFIGS.find((cfg) => cfg.key === activeIndicator) ||
      INDICATOR_CONFIGS[0]
    );
  }, [activeIndicator]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-500">
              Global WASH Geographic Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Regional Explorer & Interactive Map
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Visualize geospatial indicators, inspect detailed regional dossiers, and compare water-access characteristics.
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Interactive Map
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Data Grid ({records.length})
            </button>
          </div>

          {/* Quick Comparison Launch */}
          <button
            onClick={() => handleOpenComparison(null)}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-500" />
            Compare Countries
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <LoadingSpinner message="Loading geospatial survey datasets and regional profiles…" />}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          Failed to load regional data: {error}
        </div>
      )}

      {/* Main Content Area */}
      {!loading && !error && (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Map Indicator & Filter Bar (Clean Light Theme) */}
              <div className="card p-4 bg-white border border-slate-200 shadow-sm text-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Indicator Dropdown */}
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Map Indicator
                    </label>
                    <select
                      value={activeIndicator}
                      onChange={(e) => setActiveIndicator(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition"
                    >
                      {INDICATOR_CONFIGS.map((cfg) => (
                        <option key={cfg.key} value={cfg.key}>
                          {cfg.label} {cfg.isNegative ? '(Hazard Metric)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Macro-Region Filter */}
                  <div className="w-full md:w-56">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Filter Region
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition"
                    >
                      <option value="ALL">All Macro-Regions ({records.length})</option>
                      {regionOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cluster Filter */}
                  <div className="w-full md:w-56">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Filter Cluster Profile
                    </label>
                    <select
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition"
                    >
                      <option value="ALL">All Clusters</option>
                      {clusterOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cluster {c.id}: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Indicator Explanation Banner */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-800">{activeIndicatorConfig.shortLabel}:</strong> {activeIndicatorConfig.description}
                    </span>
                  </div>
                  {activeIndicatorConfig.isNegative ? (
                    <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                      Hazard Indicator (Lower is better)
                    </span>
                  ) : (
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                      Target: SDG 6 (Higher is better)
                    </span>
                  )}
                </div>
              </div>

              {/* World Map Container */}
              <InteractiveWorldMap
                records={filteredRecords}
                activeIndicator={activeIndicator}
                onSelectCountry={(c) => setSelectedCountry(c)}
                selectedCountry={selectedCountry}
                onAddToComparison={(c) => handleOpenComparison(c)}
              />
            </div>
          )}

          {/* Tabular Data Grid View */}
          {viewMode === 'table' && (
            <div className="space-y-6 animate-in fade-in duration-300">
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
                    <p className="text-2xl font-bold text-cyan-600 mt-1">{summary.avgWater}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Basic drinking service</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Highest Access</p>
                    <p className="text-lg font-bold text-teal-600 mt-1 truncate" title={summary.highest?.name}>
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

              {/* Geographic Macro-Region Visualizer */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-500" /> Macro-Region Breakdown
                  </h2>
                  <span className="text-xs text-slate-400">Click a region to filter table</span>
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
                            ? 'border-cyan-500 bg-cyan-50 shadow-sm'
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

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

              {/* Data Table */}
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
                        <th className="p-3.5 text-center">Actions</th>
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
                                          ? 'bg-teal-500'
                                          : waterVal >= 60
                                          ? 'bg-cyan-500'
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
                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setSelectedCountry(r)}
                                    className="text-xs text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-0.5"
                                  >
                                    Inspect <ChevronRight className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenComparison(r)}
                                    title="Add to comparison"
                                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Comprehensive Country Detail Drawer Panel */}
      <CountryDetailPanel
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onAddToComparison={(c) => handleOpenComparison(c)}
        globalAverages={globalAverages}
      />

      {/* Comprehensive Country Comparison Modal */}
      <CountryComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        allCountries={records}
        initialSelected={comparisonInitial}
      />
    </div>
  );
}
