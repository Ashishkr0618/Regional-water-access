import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, BarChart2, FlaskConical, Droplets, ArrowRight, Globe2 } from 'lucide-react';
import { getDashboard } from '../services/api.js';

// Fade-up animation variant reused across sections
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
};

const FEATURES = [
  {
    icon: FlaskConical,
    color: 'text-aqua',
    bg: 'bg-aqua/10',
    title: 'K-Means Clustering',
    desc: 'Unsupervised grouping of regions by water-access metrics — revealing hidden patterns across countries and continents.',
  },
  {
    icon: BarChart2,
    color: 'text-teal',
    bg: 'bg-teal/10',
    title: 'PCA Visualization',
    desc: 'Principal Component Analysis projects high-dimensional water data onto a 2-D plane you can explore interactively.',
  },
  {
    icon: Droplets,
    color: 'text-violet-500',
    bg: 'bg-violet-100',
    title: 'Water Quality Prediction',
    desc: 'A Random Forest model predicts whether a water sample is potable based on physicochemical parameters.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  // Fetch a few hero stats from the backend for the animated cards
  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => {}); // fail silently on landing page
  }, []);

  const heroStats = [
    { label: 'Regions Analyzed', value: stats?.total_regions ?? '—' },
    { label: 'Avg Water Access', value: stats?.avg_basic_water_access != null ? `${stats.avg_basic_water_access.toFixed(1)}%` : '—' },
    { label: 'Dataset Records', value: stats?.dataset_records ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-aqua/20 flex items-center justify-center">
              <Waves className="w-4 h-4 text-aqua" />
            </div>
            <span className="font-bold text-white text-lg">AquaScope</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-aqua hover:bg-aqua-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-aqua/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-aqua mb-6">
            <Globe2 className="w-3.5 h-3.5" />
            College ML Project · Demo Platform
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5">
            <span className="gradient-text">Regional Water</span>
            <br />
            <span className="text-white">Intelligence</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} custom={2} className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Analyze water-access patterns across regions using unsupervised machine learning — K-Means clustering, PCA visualization, and quality prediction powered by WHO/UNICEF sample data.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-aqua hover:bg-aqua-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Explore Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/clustering"
              className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              View ML Analysis <FlaskConical className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Hero stat cards */}
          <motion.div variants={fadeUp} custom={4} className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {heroStats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center animate-float">
                <p className="text-2xl font-bold text-aqua">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-slate-900/60 border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-white mb-3">
              What AquaScope Can Do
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-xl mx-auto">
              Three ML pipelines working together to surface insights about global water access.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-aqua/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-slate-500 text-sm">
          AquaScope v1.0 &mdash; College ML Project Demo &mdash; Data sourced from WHO/UNICEF JMP (sample / synthetic for demonstration).
        </p>
        <p className="text-slate-600 text-xs mt-1">
          Not intended for real-world policy decisions.
        </p>
      </footer>
    </div>
  );
}
