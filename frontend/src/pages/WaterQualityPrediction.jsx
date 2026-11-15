import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Droplets, AlertCircle, CheckCircle, XCircle, FlaskConical,
  ShieldAlert, History, MapPin, Info, ArrowRight, RotateCcw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { predictWaterQuality, getDataset, getPredictionHistory } from '../services/api.js';

const PARAMS = [
  { key: 'ph', label: 'pH', unit: '', hint: 'WHO Guideline: 6.5–8.5', min: 0, max: 14, step: 0.1 },
  { key: 'Hardness', label: 'Hardness', unit: 'mg/L', hint: 'Typical: 50–300 mg/L', min: 0, max: 1000, step: 1 },
  { key: 'Solids', label: 'Total Dissolved Solids (TDS)', unit: 'mg/L', hint: 'WHO: < 500 mg/L', min: 0, max: 50000, step: 10 },
  { key: 'Chloramines', label: 'Chloramines', unit: 'mg/L', hint: 'EPA Limit: < 4 mg/L', min: 0, max: 15, step: 0.1 },
  { key: 'Sulfate', label: 'Sulfate', unit: 'mg/L', hint: 'WHO Guideline: < 250 mg/L', min: 0, max: 1000, step: 1 },
  { key: 'Conductivity', label: 'Electrical Conductivity', unit: 'μS/cm', hint: 'Typical: < 400 μS/cm', min: 0, max: 2000, step: 1 },
  { key: 'Organic_carbon', label: 'Organic Carbon (TOC)', unit: 'mg/L', hint: 'EPA Guideline: < 2 mg/L', min: 0, max: 50, step: 0.1 },
  { key: 'Trihalomethanes', label: 'Trihalomethanes (THMs)', unit: 'μg/L', hint: 'WHO Limit: < 80 μg/L', min: 0, max: 150, step: 0.1 },
  { key: 'Turbidity', label: 'Turbidity', unit: 'NTU', hint: 'WHO Guideline: < 4 NTU', min: 0, max: 20, step: 0.1 },
];

const SAMPLE_POTABLE = {
  ph: 7.3, Hardness: 165, Solids: 310, Chloramines: 3.2,
  Sulfate: 210, Conductivity: 380, Organic_carbon: 1.8,
  Trihalomethanes: 35, Turbidity: 2.1,
};

const SAMPLE_NOT_POTABLE = {
  ph: 5.2, Hardness: 420, Solids: 14500, Chloramines: 9.8,
  Sulfate: 460, Conductivity: 950, Organic_carbon: 14.5,
  Trihalomethanes: 98, Turbidity: 7.8,
};

const FEAT_COLORS = ['#0ea5e9','#14b8a6','#8b5cf6','#f59e0b','#ef4444','#22c55e','#3b82f6','#ec4899','#f97316'];

export default function WaterQualityPrediction() {
  const [form, setForm] = useState({
    ph: '', Hardness: '', Solids: '', Chloramines: '',
    Sulfate: '', Conductivity: '', Organic_carbon: '',
    Trihalomethanes: '', Turbidity: '', region: '',
  });

  const [countries, setCountries] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getDataset()
      .then((d) => {
        const unique = [...new Set(d.preview?.map((r) => r.country).filter(Boolean))].sort();
        setCountries(unique);
      })
      .catch(() => {});

    loadHistory();
  }, []);

  const loadHistory = () => {
    getPredictionHistory(6)
      .then((res) => setHistory(res.history || []))
      .catch(() => {});
  };

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fillSample = (sample) => setForm((f) => ({ ...f, ...sample }));

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setResult(null);

      const payload = {};
      PARAMS.forEach(({ key }) => {
        const v = parseFloat(form[key]);
        if (!isNaN(v)) payload[key] = v;
      });
      if (form.region) payload.region = form.region;

      predictWaterQuality(payload)
        .then((res) => {
          setResult(res);
          loadHistory();
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [form]
  );

  const featureImportanceData = result?.feature_importances
    ? Object.entries(result.feature_importances)
        .map(([k, v]) => ({ name: k, importance: parseFloat((v * 100).toFixed(2)) }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  const isPotable = result?.prediction === 1 || result?.prediction_label === 'Potable';
  const confidence = result?.confidence != null ? Math.round(result.confidence * 100) : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Water Quality Prediction Module</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Trained Random Forest Classifier estimating sample potability from physicochemical properties.
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-outline text-xs self-start sm:self-auto py-2 px-3"
        >
          <History className="w-3.5 h-3.5 text-aqua" />
          {showHistory ? 'Hide History' : 'View Prediction History'}
        </button>
      </div>

      {/* Optional History Drawer/Card */}
      {showHistory && (
        <div className="card p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <History className="w-4 h-4 text-aqua" /> Recent Predictions (SQLite Log)
            </h2>
            <button onClick={loadHistory} className="text-xs text-aqua hover:underline flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No predictions logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Region</th>
                    <th className="p-2">pH</th>
                    <th className="p-2">Solids (TDS)</th>
                    <th className="p-2">Hardness</th>
                    <th className="p-2">Classification</th>
                    <th className="p-2 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="p-2 text-slate-500">{h.timestamp}</td>
                      <td className="p-2 font-medium text-slate-700">{h.region || '—'}</td>
                      <td className="p-2">{h.ph?.toFixed(1) ?? '—'}</td>
                      <td className="p-2">{h.solids?.toFixed(0) ?? '—'}</td>
                      <td className="p-2">{h.hardness?.toFixed(0) ?? '—'}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            h.prediction === 1
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {h.prediction_label || (h.prediction === 1 ? 'Potable' : 'Not Potable')}
                        </span>
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-700">
                        {h.confidence != null ? `${(h.confidence * 100).toFixed(0)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LEFT: Parameter Input Form ── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <FlaskConical className="w-5 h-5 text-aqua" /> Physicochemical Inputs
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillSample(SAMPLE_POTABLE)}
                className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-md font-medium border border-emerald-200 transition-colors"
              >
                Sample: Potable
              </button>
              <button
                type="button"
                onClick={() => fillSample(SAMPLE_NOT_POTABLE)}
                className="text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1 rounded-md font-medium border border-rose-200 transition-colors"
              >
                Sample: Non-Potable
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PARAMS.map((p) => (
                <div key={p.key}>
                  <label className="form-label">
                    {p.label}
                    {p.unit && <span className="text-slate-400 font-normal"> ({p.unit})</span>}
                  </label>
                  <input
                    type="number"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    className="form-input text-sm"
                    placeholder="Enter value…"
                    value={form[p.key]}
                    onChange={handleChange(p.key)}
                    required
                  />
                  <p className="form-hint">{p.hint}</p>
                </div>
              ))}

              {/* Optional Region Selection */}
              <div className="sm:col-span-2">
                <label className="form-label">
                  Survey Region <span className="text-slate-400 font-normal">(Optional context)</span>
                </label>
                <select
                  className="form-input text-sm"
                  value={form.region}
                  onChange={handleChange('region')}
                >
                  <option value="">— Select a survey country or region —</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="form-hint">
                  Note: Model prediction is strictly computed from water chemical parameters, not geographic location.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-teal w-full py-2.5 text-sm font-semibold justify-center shadow-sm"
                disabled={loading}
              >
                <Droplets className="w-4 h-4" />
                {loading ? 'Evaluating Model…' : 'Classify Water Potability'}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-rose-700 text-xs">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* ── RIGHT: Model Evaluation & Predictions ── */}
        <div className="space-y-5">
          {loading && (
            <div className="card p-12">
              <LoadingSpinner message="Applying Random Forest decision trees…" />
            </div>
          )}

          {result && !loading && (
            <>
              {/* Primary Result Banner */}
              <div
                className={`card p-6 border-2 shadow-sm ${
                  isPotable ? 'border-emerald-400 bg-emerald-50/20' : 'border-rose-400 bg-rose-50/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isPotable ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {isPotable ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Predicted Classification
                    </span>
                    <h3
                      className={`text-2xl font-extrabold ${
                        isPotable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isPotable ? 'POTABLE WATER' : 'NOT POTABLE (UNSAFE)'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isPotable
                        ? 'Physicochemical indicators fall within acceptable modeled drinking standards.'
                        : 'Sample exhibits parameters associated with water quality contamination or hazard.'}
                    </p>
                  </div>
                </div>

                {/* Calibrated Confidence Score */}
                {confidence !== null && (
                  <div className="mt-5 pt-4 border-t border-slate-200/60">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span>Model Probability Confidence</span>
                      <span className="font-bold text-slate-800">{confidence}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isPotable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Regional Access Indicator Context (if selected) */}
              {result.region_info && (
                <div className="card p-4 bg-sky-50/60 border border-sky-100">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-sky-900">
                      Regional WASH Baseline Context
                    </span>
                  </div>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    {result.region_info.note}
                    {result.region_info.avg_basic_water_access_pct && (
                      <span className="font-semibold block mt-1">
                        Regional Basic Water Access Baseline: {result.region_info.avg_basic_water_access_pct}%
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Guideline Flags Card (Parameters outside safe bounds) */}
              {result.parameter_flags && result.parameter_flags.length > 0 && (
                <div className="card p-5 border-amber-200 bg-amber-50/30">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Detected Parameter Guideline Flags ({result.parameter_flags.length})
                  </h4>
                  <div className="space-y-1.5 text-xs text-amber-900">
                    {result.parameter_flags.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-white/70 border border-amber-200/60">
                        <div>
                          <strong className="capitalize">{f.parameter}</strong>: {f.value}
                          <span className="text-slate-500 block text-[10px]">{f.guideline}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Importance Chart */}
              {featureImportanceData.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Random Forest Parameter Importance
                  </h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart
                      data={featureImportanceData}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                        {featureImportanceData.map((_, i) => (
                          <Cell key={i} fill={FEAT_COLORS[i % FEAT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-700 block mb-1">Notice:</strong>
                {result.disclaimer}
              </div>
            </>
          )}

          {!result && !loading && !error && (
            <div className="card p-12 text-center border-dashed border-2 border-slate-200">
              <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">Awaiting Chemical Indicators</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                Enter your test measurements or click one of the quick sample buttons above to run the Random Forest model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
