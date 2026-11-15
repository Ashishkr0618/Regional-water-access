import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClusterAnalysis from './pages/ClusterAnalysis.jsx';
import WaterQualityPrediction from './pages/WaterQualityPrediction.jsx';
import RegionalExplorer from './pages/RegionalExplorer.jsx';
import AboutProject from './pages/AboutProject.jsx';

// Conditionally renders sidebar — landing page has its own full layout
function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="page-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clustering" element={<ClusterAnalysis />} />
          <Route path="/predict" element={<WaterQualityPrediction />} />
          <Route path="/explorer" element={<RegionalExplorer />} />
          <Route path="/about" element={<AboutProject />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
