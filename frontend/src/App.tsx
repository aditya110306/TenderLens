import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DemoProvider } from './context/DemoContext';
import AIPanel from './components/AIPanel';
import Dashboard from './pages/Dashboard';
import Ingestion from './pages/Ingestion';
import FlaggedCases from './pages/FlaggedCases';
import CaseDetail from './pages/CaseDetail';
import VendorGraph from './pages/VendorGraph';
import CaseBoard from './pages/CaseBoard';
import Reports from './pages/Reports';

function AppContent() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 ${aiOpen ? 'mr-80' : 'mr-0'}`}>
      <Layout onOpenAI={() => setAiOpen(!aiOpen)} aiOpen={aiOpen}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingestion" element={<Ingestion />} />
          <Route path="/cases" element={<FlaggedCases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/graph" element={<VendorGraph />} />
          <Route path="/board" element={<CaseBoard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </BrowserRouter>
  );
}
