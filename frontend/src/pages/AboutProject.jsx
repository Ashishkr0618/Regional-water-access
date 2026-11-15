import React, { useEffect, useState } from 'react';
import {
  BookOpen, Award, CheckCircle2, AlertTriangle, Layers, BrainCircuit,
  Database, GitBranch, ShieldAlert, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { getWaterQualityMetrics, getEvaluation } from '../services/api.js';

export default function AboutProject() {
  const [wqMetrics, setWqMetrics] = useState(null);
  const [clusteringMetrics, setClusteringMetrics] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    getWaterQualityMetrics()
      .then((res) => setWqMetrics(res.metrics))
      .catch(() => {});

    getEvaluation()
      .then(setClusteringMetrics)
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'Why standardize features using StandardScaler before K-Means clustering?',
      a: 'K-Means optimizes squared Euclidean distance. If one indicator is measured on a 0–100 scale and another on a 0–1 scale, the feature with larger variance dominates the distance calculation. StandardScaler transforms every feature to have zero mean and unit variance (μ=0, σ=1), giving each water indicator equal mathematical weighting.',
    },
    {
      q: 'How is the optimal number of clusters (K) chosen defensibly?',
      a: 'Rather than relying on a single automated metric, we cross-validate three complementary indicators: 1) The Elbow Method (WCSS) looks for diminishing marginal returns in cluster tightness; 2) The Silhouette Score evaluates intra-cluster cohesion versus nearest-cluster separation; 3) The Davies-Bouldin Index measures worst-case similarity between clusters. K=3 or K=4 provides the cleanest balance between cluster cohesion and interpretable real-world WASH profiles.',
    },
    {
      q: 'Does standard K-Means allow switching to Manhattan distance?',
      a: 'No. Standard K-Means (Lloyd’s algorithm) mathematically minimizes squared Euclidean distance because the cluster mean is the unique minimizer of squared Euclidean deviations. To compare with Manhattan (L1) distance, we transparently use Agglomerative Clustering with average linkage and L1 distance, and compare cluster structure using the Adjusted Rand Index (ARI).',
    },
    {
      q: 'Why choose Random Forest for the secondary water potability prediction?',
      a: 'Water chemistry indicators exhibit complex non-linear interactions and cross-correlations (e.g. pH interacting with chloramine efficacy). Random Forest builds an ensemble of decorrelated decision trees, handles mild class imbalance via class weighting, resists overfitting, and outputs feature importances that explain predictions to students and domain experts.',
    },
    {
      q: 'Can ML predictions replace physical laboratory water testing?',
      a: 'Never. Machine learning estimates based on public survey datasets serve exploratory, educational, and prioritization roles. Certifying potable water requires certified microbiological tests (e.g. E. coli, heavy metals) adhering to WHO or national regulatory benchmarks.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aqua/10 text-aqua text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Project Documentation & Viva Guide
        </div>
        <h1 className="text-3xl font-bold text-slate-800">
          Regional Water-Access Profiles from Survey Indicators Using Clustering
        </h1>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          A machine learning platform combining Unsupervised Regional Clustering (K-Means & PCA) and Supervised Water Quality Classification (Random Forest) for environmental data analysis.
        </p>
      </div>

      {/* ── SECTION 1: Project Motivation & SDG 6 ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-teal" /> Problem Statement & Motivation
        </h2>
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            Access to clean water, adequate sanitation, and hygiene (WASH) is a universal human right and the cornerstone of <strong>UN Sustainable Development Goal 6 (SDG 6)</strong>. Yet billions of individuals worldwide face acute infrastructure inequalities, particularly across rural communities.
          </p>
          <p>
            Standard aggregated national metrics often obscure nuanced regional patterns. By applying <strong>Unsupervised Machine Learning</strong> to multi-dimensional survey indicators, AquaScope partitions countries into coherent regional access profiles based on empirical data rather than geographic assumptions.
          </p>
        </div>
      </section>

      {/* ── SECTION 2: Architecture & Workflow ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <BrainCircuit className="w-5 h-5 text-aqua" /> System Architecture & ML Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Module 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-800 text-sm">Primary Module: Regional Clustering</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-1">
              <li><strong>Algorithm:</strong> K-Means with k-means++ initialization & Lloyd's optimization.</li>
              <li><strong>Indicators:</strong> Basic water %, Safely managed %, Unimproved %, Surface water %, Rural/Urban split, Sanitation %, Hygiene %.</li>
              <li><strong>Preprocessing:</strong> Column mean imputation & StandardScaler normalization.</li>
              <li><strong>Dimensionality Reduction:</strong> 2-Component PCA capturing dominant variance for 2D visualization.</li>
              <li><strong>Model Selection:</strong> Elbow method (WCSS), Silhouette score, and Davies-Bouldin index.</li>
              <li><strong>Distance Benchmark:</strong> Squared Euclidean L2 vs Manhattan L1 via Adjusted Rand Index.</li>
            </ul>
          </div>

          {/* Module 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-800 text-sm">Secondary Module: Water Quality Classifier</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-1">
              <li><strong>Algorithm:</strong> Random Forest Classifier (100 estimators, max depth 10).</li>
              <li><strong>Parameters:</strong> pH, Hardness, TDS Solids, Chloramines, Sulfate, Conductivity, Organic Carbon, Trihalomethanes, Turbidity.</li>
              <li><strong>Preprocessing:</strong> Column median imputation for missing values, 80/20 stratified split.</li>
              <li><strong>Persistence:</strong> Model bundle (model + scaler + feature metadata) serialized via Joblib.</li>
              <li><strong>Explainability:</strong> Feature importance distribution and parameter safety range flags.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Live Model Performance ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-violet-500" /> Empirical Model Evaluation Results
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Quality RF Results */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/70">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Random Forest Potability Classifier (Held-Out Test Set)
            </h3>
            {wqMetrics ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400">Accuracy</p>
                    <p className="text-lg font-bold text-slate-800">{(wqMetrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400">Precision</p>
                    <p className="text-lg font-bold text-teal">{(wqMetrics.precision * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400">Recall</p>
                    <p className="text-lg font-bold text-aqua">{(wqMetrics.recall * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {wqMetrics.confusion_matrix && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-700 mb-2">Confusion Matrix (2x2):</p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-slate-50 rounded">
                        <span className="text-slate-400 block text-[10px]">True Negative</span>
                        <strong className="text-slate-800">{wqMetrics.confusion_matrix[0]?.[0]}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <span className="text-slate-400 block text-[10px]">False Positive</span>
                        <strong className="text-slate-800">{wqMetrics.confusion_matrix[0]?.[1]}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <span className="text-slate-400 block text-[10px]">False Negative</span>
                        <strong className="text-slate-800">{wqMetrics.confusion_matrix[1]?.[0]}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <span className="text-slate-400 block text-[10px]">True Positive</span>
                        <strong className="text-slate-800">{wqMetrics.confusion_matrix[1]?.[1]}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading model performance metrics…</p>
            )}
          </div>

          {/* Clustering Performance Results */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/70">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Clustering Multi-K Benchmarks
            </h3>
            {clusteringMetrics?.metrics ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <thead className="bg-slate-100/70 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Clusters (K)</th>
                      <th className="p-2 text-right">WCSS</th>
                      <th className="p-2 text-right">Silhouette</th>
                      <th className="p-2 text-right">Davies-Bouldin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clusteringMetrics.metrics.map((m) => (
                      <tr key={m.k} className={m.k === 3 ? 'bg-sky-50/60 font-semibold text-sky-900' : ''}>
                        <td className="p-2">
                          K = {m.k} {m.k === 3 && <span className="text-[10px] text-sky-600">(Selected)</span>}
                        </td>
                        <td className="p-2 text-right text-slate-600">{m.wcss.toFixed(1)}</td>
                        <td className="p-2 text-right text-teal">{m.silhouette_score.toFixed(3)}</td>
                        <td className="p-2 text-right text-violet-600">{m.davies_bouldin_score.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading clustering benchmarks…</p>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Limitations & Responsible Data Use ── */}
      <section className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
        <h2 className="text-base font-bold text-amber-900 flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          Project Limitations & Responsible Use of Water Data
        </h2>
        <ul className="space-y-2 text-xs text-amber-800 leading-relaxed list-disc list-inside">
          <li>
            <strong>Survey Lag:</strong> Global WASH surveys (JMP/UNICEF) aggregate multi-year national census and household survey reports; local real-time water crises may not be reflected instantly.
          </li>
          <li>
            <strong>Physical Laboratory Verification:</strong> Water potability cannot be certified purely by software prediction. Chemical, radiological, and microbiological pathogens require certified laboratory testing.
          </li>
          <li>
            <strong>Ecological Fallacy:</strong> National or regional averages must not be used to assume identical water access for individual households within that area.
          </li>
        </ul>
      </section>

      {/* ── SECTION 5: Viva / Oral Examination Guide ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-aqua" /> Viva & College Oral Examination Q&A
        </h2>
        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 bg-slate-50/50 hover:bg-slate-100/60 flex items-center justify-between text-xs font-semibold text-slate-800"
                >
                  <span>{f.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
