import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Flag, Network, Kanban, FileText,
  Bot, Shield, ChevronLeft, ChevronRight, Bell, Search,
  Activity, Sparkles
} from 'lucide-react';
import { useDemoMode } from '../context/DemoContext';

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',       id: 'nav-dashboard' },
  { to: '/ingestion',     icon: Upload,          label: 'Data Ingestion',  id: 'nav-ingestion' },
  { to: '/cases',         icon: Flag,            label: 'Flagged Cases',   id: 'nav-cases' },
  { to: '/graph',         icon: Network,         label: 'Vendor Graph',    id: 'nav-graph' },
  { to: '/board',         icon: Kanban,          label: 'Case Board',      id: 'nav-board' },
  { to: '/reports',       icon: FileText,        label: 'Reports',         id: 'nav-reports' },
];

interface LayoutProps {
  children: React.ReactNode;
  onOpenAI: () => void;
  aiOpen: boolean;
}

export function Layout({ children, onOpenAI, aiOpen }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { demoActive, currentStep } = useDemoMode();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gradient-to-b from-navy-900 to-navy-800 border-r border-gray-800/60 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center shadow-glow-blue">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white leading-tight">TenderLens</p>
              <p className="text-[10px] text-accent-400 font-medium uppercase tracking-widest">AI Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => (
            <NavLink
              key={to}
              to={to}
              id={id}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} ${!collapsed ? '' : 'justify-center !px-2'}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className={`sidebar-icon w-4.5 h-4.5 flex-shrink-0 ${collapsed ? '' : ''}`} />
              {!collapsed && <span className="text-sm truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* AI Button */}
        <div className="px-2 pb-3">
          <button
            id="nav-ai"
            onClick={onOpenAI}
            title={collapsed ? 'AI Assistant' : undefined}
            className={`sidebar-item w-full ${aiOpen ? 'active' : ''} ${!collapsed ? '' : 'justify-center !px-2'}`}
          >
            <Bot className="sidebar-icon w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && <span className="text-sm truncate">AI Assistant</span>}
            {!collapsed && <Sparkles className="w-3 h-3 text-amber-400 ml-auto flex-shrink-0" />}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="px-2 pb-4 border-t border-white/5 pt-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`sidebar-item w-full ${!collapsed ? '' : 'justify-center !px-2'}`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs text-gray-500">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Demo mode indicator */}
        {demoActive && (
          <div className="bg-accent-600/20 border-b border-accent-600/30 px-6 py-2 flex items-center gap-3">
            <Activity className="w-4 h-4 text-accent-400 animate-pulse" />
            <span className="text-xs font-medium text-accent-300">Demo Mode Active — Step {currentStep}</span>
            <span className="text-xs text-gray-400 ml-2">Automated walkthrough in progress</span>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const getPageTitle = () => {
    const map: Record<string, string> = {
      '/': 'Overview Dashboard',
      '/ingestion': 'Data Ingestion',
      '/cases': 'Flagged Cases',
      '/graph': 'Vendor Relationship Graph',
      '/board': 'Case Management Board',
      '/reports': 'Investigation Reports',
    };
    if (location.pathname.startsWith('/cases/')) return 'Case Detail';
    return map[location.pathname] || 'TenderLens';
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900/60 border-b border-gray-800/60 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-200">{getPageTitle()}</h1>
        <span className="text-xs text-gray-600">|</span>
        <span className="text-xs text-gray-500">FY 2024–25 Dataset</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search cases, vendors..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value.length > 2) navigate(`/cases?q=${e.target.value}`);
            }}
            className="input pl-8 w-52 py-1.5 text-xs"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
          <div className="w-7 h-7 rounded-full bg-accent-600 flex items-center justify-center text-xs font-bold text-white">A</div>
          <span className="text-xs text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  );
}
