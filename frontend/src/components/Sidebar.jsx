import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BarChart2,
  FlaskConical,
  Droplets,
  Map,
  Info,
  Waves,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { to: '/clustering', label: 'Cluster Analysis', icon: FlaskConical },
  { to: '/predict', label: 'Water Quality', icon: Droplets },
  { to: '/explorer', label: 'Regional Explorer', icon: Map },
  { to: '/about', label: 'About', icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-navy flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-aqua/20 flex items-center justify-center animate-pulse-ring">
            <Waves className="w-5 h-5 text-aqua" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">AquaScope</p>
            <p className="text-aqua/70 text-[10px] font-medium uppercase tracking-wider leading-tight mt-0.5">
              Regional Water Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-aqua/20 text-aqua border border-aqua/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-slate-500 text-xs">AquaScope v1.0</p>
        <p className="text-slate-600 text-[10px] mt-0.5">College ML Project · Demo</p>
      </div>
    </aside>
  );
}
