import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  FlaskConical, ChevronDown, Play, AlertCircle, Info, Upload,
  Scale, ShieldCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ClusterBadge, { CLUSTER_CHART_COLORS } from '../components/ClusterBadge.jsx';
import { getDataset, runClustering, getEvaluation, uploadDataset } from '../services/api.js';

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 my-4">
      <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
      <p className="text-rose-700 text-sm">{message}</p>
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-lg p-3 mt-2">
      <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
      <p className="text-sky-700 text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-800 text-sm">{d?.region ?? 'Region'}</p>
      <p className="text-xs text-slate-500">PC1: {d?.x?.toFixed(3)}</p>
      <p className="text-xs text-slate-500">PC2: {d?.y?.toFixed(3)}</p>
      <p className="text-xs mt-1">Cluster: <strong>{d?.clusterName}</strong></p>
    </div>
  );
}

export default function ClusterAnalysis() {
  // Dataset state
  const [dataset, setDataset] = useState(null);
  const [dsLoading, setDsLoading] = useState(true);
  const [dsError, setDsError] = useState(null);

  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Evaluation metrics state
  const [evalData, setEvalData] = useState(null);
  const [evalLoading, setEvalLoading] = useState(true);
  const [evalError, setEvalError] = useState(null);

  // Clustering state
  const [nClusters, setNclusters] = useState(3);
  const [clusterResult, setClusterResult] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterError, setClusterError] = useState(null);

  const fetchDataset = useCallback(() => {
    setDsLoading(true);
    getDataset()
      .then(setDataset)
      .catch((e) => setDsError(e.message))
      .finally(() => setDsLoading(false));
  }, []);

  const fetchEvaluation = useCallback(() => {
    setEvalLoading(true);
    getEvaluation()
      .then(setEvalData)
      .catch((e) => setEvalError(e.message))
      .finally(() => setEvalLoading(false));
  }, []);

  useEffect(() => {
    fetchDataset();
    fetchEvaluation();
    // Pre-run default K=3 clustering
    runClustering(3)
      .then(setClusterResult)
      .catch(() => {});
  }, [fetchDataset, fetchEvaluation]);

  const handleRunClustering = useCallback(() => {
    setClusterLoading(true);
    setClusterError(null);
    runClustering(nClusters)
      .then(setClusterResult)
      .catch((e) => setClusterError(e.message))
      .finally(() => setClusterLoading(false));
  }, [nClusters]);

  // CSV File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    uploadDataset(file)
      .then((res) => {
        setUploadSuccess(`Uploaded ${file.name} successfully (${res.rows} records)!`);
        fetchDataset();
        fetchEvaluation();
        handleRunClustering();
      })
      .catch((err) => {
        setUploadError(err.message);
      })
      .finally(() => {
        setUploadLoading(false);
        e.target.value = '';
      });
  };

  // Group PCA coordinates by cluster
  const scatterSeries = useMemo(() => {
    if (!clusterResult?.pca_coords || !clusterResult?.regions) return [];
    const { pca_coords, regions, labels, cluster_profiles } = clusterResult;

    const groups = {};
    pca_coords.forEach(([x, y], i) => {
      const lbl = labels[i] ?? 0;
      if (!groups[lbl]) groups[lbl] = [];
      const profileName = cluster_profiles?.[lbl]?.cluster_name ?? `Cluster ${lbl}`;
      groups[lbl].push({ x, y, region: regions[i], clusterName: profileName });
    });

    return Object.entries(groups).map(([lbl, points]) => ({
      lbl: parseInt(lbl),
      name: cluster_profiles?.[lbl]?.cluster_name ?? `Cluster ${lbl}`,
      points,
    }));
  }, [clusterResult]);

  // Cluster comparison bar chart data
  const clusterBarData = useMemo(() => {
    if (!clusterResult?.cluster_profiles) return [];
    return Object.values(clusterResult.cluster_profiles).map((p) => ({
      name: p.cluster_name ?? `Cluster ${p.cluster_id}`,
      'Water Access': parseFloat((p.avg_basic_water_access_pct ?? 0).toFixed(1)),
      'Sanitation': parseFloat((p.avg_sanitation_access_pct ?? 0).toFixed(1)),
      'Hygiene': parseFloat((p.avg_hygiene_availability_pct ?? 0).toFixed(1)),
    }));
  }, [clusterResult]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Unsupervised Cluster Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          K-Means clustering, PCA dimensionality reduction, model selection benchmarks, and distance metric comparisons.
        </p>
      </div>

      {/* ── SECTION 1: Dataset & Preprocessing Summary ── */}
      <section className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="section-title flex items-center gap-2 mb-0">
            <FlaskConical className="w-5 h-5 text-aqua" /> Dataset & Preprocessing Pipeline
          </h2>

          {/* Upload CSV button */}
          <div className="flex items-center gap-3">
            <label className="btn-outline text-xs cursor-pointer flex items-center gap-1.5 py-2 px-3">
              <Upload className="w-3.5 h-3.5 text-aqua" />
              {uploadLoading ? 'Uploading…' : 'Upload CSV Dataset'}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
            </label>
          </div>
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {uploadSuccess}
          </div>
        )}
        {uploadError && <ErrorBanner message={uploadError} />}

        {dsLoading && <LoadingSpinner message="Loading dataset preview…" />}
        {dsError && <ErrorBanner message={`Dataset unavailable: ${dsError}`} />}

        {dataset && (
          <>
            {/* Preprocessing Summary Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800">{dataset.total_rows}</p>
                <p className="text-xs text-slate-500 mt-1">Total Records Loaded</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-2xl font-bold text-aqua">{dataset.features_count}</p>
                <p className="text-xs text-slate-500 mt-1">Features Used in ML</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800">{dataset.total_missing_values ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Missing Values Imputed</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-sm font-bold text-teal mt-1">StandardScaler</p>
                <p className="text-xs text-slate-500 mt-2">Zero Mean, Unit Variance</p>
              </div>
            </div>

            {/* Scrollable dataset preview */}
            <div className="overflow-auto max-h-64 rounded-lg border border-slate-200">
              <table className="data-table">
                <thead>
                  <tr>
                    {dataset.columns?.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.preview?.slice(0, 15).map((row, i) => (
                    <tr key={i}>
                      {dataset.columns?.map((col) => (
                        <td key={col}>{row[col] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ── SECTION 2: Run K-Means Clustering ── */}
      <section className="card p-6">
        <h2 className="section-title">Configure K-Means Model</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="form-label">Cluster Count (K)</label>
            <div className="relative">
              <select
                className="form-input pr-8 appearance-none text-sm"
                value={nClusters}
                onChange={(e) => setNclusters(parseInt(e.target.value))}
              >
                {[2, 3, 4, 5, 6].map((k) => (
                  <option key={k} value={k}>
                    K = {k} clusters
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleRunClustering}
            disabled={clusterLoading}
          >
            <Play className="w-4 h-4" />
            {clusterLoading ? 'Clustering…' : 'Run Clustering'}
          </button>
        </div>

        {clusterLoading && <LoadingSpinner message={`Running K-Means algorithm for K=${nClusters}…`} />}
        {clusterError && <ErrorBanner message={`Clustering failed: ${clusterError}`} />}
        {clusterResult && !clusterLoading && (
          <p className="mt-3 text-xs text-teal font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            Successfully clustered {clusterResult.regions?.length} regions into {clusterResult.n_clusters} distinct profiles.
          </p>
        )}
      </section>

      {/* ── SECTION 3: Evaluation Metrics (Elbow, Silhouette, Davies-Bouldin) ── */}
      <section className="card p-6">
        <h2 className="section-title">Model Selection & Evaluation Benchmarks</h2>
        <p className="text-xs text-slate-500 mb-4">
          Compare cluster compactness and separation across candidate values of K (2 through 6).
        </p>

        {evalLoading && <LoadingSpinner message="Calculating evaluation metrics…" />}
        {evalError && <ErrorBanner message={`Evaluation unavailable: ${evalError}`} />}

        {evalData?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Elbow WCSS */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Elbow Method (WCSS)
              </h3>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={evalData.metrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => v.toFixed(2)} />
                  <Line type="monotone" dataKey="wcss" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} name="WCSS" />
                </LineChart>
              </ResponsiveContainer>
              <InfoBox>
                Within-Cluster Sum of Squares (Inertia). Lower = tighter clusters. The optimal K is near the elbow bend where marginal error reduction flattens.
              </InfoBox>
            </div>

            {/* Silhouette Score */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                2. Silhouette Score
              </h3>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={evalData.metrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 0.8]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => v.toFixed(3)} />
                  <Line type="monotone" dataKey="silhouette_score" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} name="Silhouette" />
                  {evalData.best_k_silhouette && (
                    <ReferenceLine x={evalData.best_k_silhouette} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Peak', fontSize: 10 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <InfoBox>
                Measures how close each point is to its assigned cluster vs. other clusters (-1 to +1). Peak score indicates best separation.
              </InfoBox>
            </div>

            {/* Davies-Bouldin Index */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                3. Davies-Bouldin Index
              </h3>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={evalData.metrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => v.toFixed(3)} />
                  <Line type="monotone" dataKey="davies_bouldin_score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="DB Index" />
                  {evalData.best_k_davies && (
                    <ReferenceLine x={evalData.best_k_davies} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Min', fontSize: 10 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <InfoBox>
                Measures worst-case similarity between clusters. Lower score indicates superior cluster distinction and minimal overlap.
              </InfoBox>
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 4 & 5: Shown after clustering ── */}
      {clusterResult && !clusterLoading && (
        <>
          {/* PCA 2D Visualization */}
          <section className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h2 className="section-title mb-0">PCA 2D Cluster Projection</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Explained Variance: PC1 ({clusterResult.explained_variance?.[0]}%) + PC2 ({clusterResult.explained_variance?.[1]}%) ={' '}
                <strong>
                  {clusterResult.explained_variance_total ||
                    (
                      (clusterResult.explained_variance?.[0] || 0) +
                      (clusterResult.explained_variance?.[1] || 0)
                    ).toFixed(1)}
                  %
                </strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Multi-dimensional survey indicators projected onto two orthogonal principal axes. Hover over any dot to see the region.
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="PC1"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -10, fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PC2"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Legend verticalAlign="top" height={32} />
                {scatterSeries.map((s) => (
                  <Scatter
                    key={s.lbl}
                    name={s.name}
                    data={s.points}
                    fill={CLUSTER_CHART_COLORS[s.lbl % CLUSTER_CHART_COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </section>

          {/* Cluster Profiles */}
          <section className="card p-6">
            <h2 className="section-title">Derived Regional Cluster Profiles</h2>
            <p className="text-xs text-slate-500 mb-4">
              Cluster designations are assigned empirically from computed means, not predefined labels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.values(clusterResult.cluster_profiles ?? {}).map((p) => (
                <div
                  key={p.cluster_id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: CLUSTER_CHART_COLORS[p.cluster_id % CLUSTER_CHART_COLORS.length],
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ClusterBadge clusterName={p.cluster_name} clusterNumber={p.cluster_id} />
                    <span className="text-xs text-slate-500 ml-auto font-medium">{p.num_regions} regions</span>
                  </div>

                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{p.summary || 'Empirical cluster grouping.'}"
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Basic Water Access</span>
                      <strong className="text-slate-800">{p.avg_basic_water_access_pct?.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Safely Managed Water</span>
                      <strong className="text-slate-800">{p.avg_safely_managed_water_pct?.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sanitation Coverage</span>
                      <strong className="text-slate-800">{p.avg_sanitation_access_pct?.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Hygiene Facilities</span>
                      <strong className="text-slate-800">{p.avg_hygiene_availability_pct?.toFixed(1)}%</strong>
                    </div>
                  </div>

                  {p.characteristics?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Key Characteristics
                      </p>
                      <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                        {p.characteristics.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.top_countries?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Representative Countries
                      </p>
                      <p className="text-xs text-slate-700">{p.top_countries.slice(0, 4).join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cluster Comparison Bar Chart */}
            {clusterBarData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Cross-Cluster Indicator Comparison
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={clusterBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend verticalAlign="top" height={28} />
                    <Bar dataKey="Water Access" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Sanitation" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Hygiene" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* ── SECTION 6: Distance Metric Benchmark (Euclidean L2 vs Manhattan L1) ── */}
          {clusterResult.distance_comparison && (
            <section className="card p-6">
              <h2 className="section-title flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal" /> Distance Metric Benchmark: Euclidean vs. Manhattan
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of standard squared Euclidean K-Means against Manhattan (L1) metric Agglomerative clustering.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block">
                    Euclidean (L2 Norm)
                  </span>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {clusterResult.distance_comparison.euclidean.algorithm}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    Silhouette Score: <strong>{clusterResult.distance_comparison.euclidean.silhouette_score}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Cluster Sizes: {clusterResult.distance_comparison.euclidean.cluster_sizes.join(', ')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-teal uppercase tracking-wider block">
                    Manhattan (L1 Norm)
                  </span>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {clusterResult.distance_comparison.manhattan.algorithm}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    Silhouette Score: <strong>{clusterResult.distance_comparison.manhattan.silhouette_score}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Cluster Sizes: {clusterResult.distance_comparison.manhattan.cluster_sizes.join(', ')}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">
                    Adjusted Rand Index (ARI): {clusterResult.distance_comparison.adjusted_rand_index}
                  </p>
                  <p>{clusterResult.distance_comparison.interpretation}</p>
                </div>
              </div>
            </section>
          )}

          {/* ── SECTION 7: Stability Analysis ── */}
          {clusterResult.stability && (
            <section className="card p-6">
              <h2 className="section-title">Cluster Stability Analysis</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-bold text-slate-800">
                    {clusterResult.stability.mean_silhouette?.toFixed(4)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Mean Silhouette</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-bold text-teal">
                    ±{clusterResult.stability.std_silhouette?.toFixed(4)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Standard Deviation</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-bold text-aqua">
                    {clusterResult.stability.mean_adjusted_rand_index}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Mean Pairwise ARI</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-base font-bold text-emerald-600 mt-1">
                    {clusterResult.stability.stability_level}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Stability Rating</p>
                </div>
              </div>
              <InfoBox>
                Stability is evaluated by executing K-Means across 10 random initial seeds. A high pairwise Adjusted Rand Index (ARI &ge; 0.8) proves the partition structure is robust to random initialization and not an artifact of random seed selection.
              </InfoBox>
            </section>
          )}
        </>
      )}
    </div>
  );
}
