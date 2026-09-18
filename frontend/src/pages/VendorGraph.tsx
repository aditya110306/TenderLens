import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { X, Building2, Award, AlertTriangle, TrendingUp, MapPin, Users } from 'lucide-react';
import { getVendorGraph, getVendor, VendorNode, VendorEdge, VendorProfile } from '../api';
import { RiskBadge } from '../components/RiskBadge';
import { useNavigate } from 'react-router-dom';

const RISK_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#65a30d',
  clear: '#16a34a',
};

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'clear';
}

export default function VendorGraph() {
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'shared_address' | 'shared_director'>('all');
  const fgRef = useRef<any>(null);

  useEffect(() => {
    getVendorGraph()
      .then(({ nodes, edges }) => {
        const gNodes = nodes.map(n => ({
          ...n,
          id: n.id,
          label: n.name,
          val: Math.max(2, n.totalContracts * 0.5),
          color: RISK_COLORS[getRiskLevel(n.riskScore)] || '#6b7280',
          __riskLevel: getRiskLevel(n.riskScore),
        }));
        const gLinks = edges.map(e => ({
          source: e.source,
          target: e.target,
          type: e.type,
          label: e.label,
          color: e.type === 'shared_address' ? '#dc2626' : e.type === 'shared_director' ? '#f59e0b' : '#6b7280',
          width: e.type === 'shared_address' ? 2 : 1,
          dashed: e.type === 'shared_director',
        }));
        setGraphData({ nodes: gNodes, links: gLinks });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    getVendor(node.id)
      .then(profile => setSelectedVendor(profile))
      .catch(() => {});
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500);
      fgRef.current.zoom(3, 500);
    }
  }, []);

  const filteredData = {
    nodes: graphData.nodes.filter(n => {
      if (filter === 'flagged') return n.flaggedCases > 0;
      return true;
    }),
    links: graphData.links.filter(l => {
      if (filter === 'shared_address') return l.type === 'shared_address';
      if (filter === 'shared_director') return l.type === 'shared_director';
      return true;
    }),
  };

  return (
    <div className="flex h-full relative">
      {/* Graph */}
      <div className="flex-1 relative">
        {/* Controls overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="card p-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-400 mb-2">Filter View</p>
            {[
              { key: 'all', label: 'All Vendors' },
              { key: 'flagged', label: 'Flagged Only' },
              { key: 'shared_address', label: 'Shared Address' },
              { key: 'shared_director', label: 'Shared Director' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`block w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                  filter === key ? 'bg-accent-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="card p-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-400 mb-1">Node Risk</p>
            {[
              { level: 'Critical', color: '#dc2626' },
              { level: 'High', color: '#ea580c' },
              { level: 'Medium', color: '#d97706' },
              { level: 'Low/Clear', color: '#16a34a' },
            ].map(({ level, color }) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-400">{level}</span>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-800">
              <p className="text-xs font-medium text-gray-400 mb-1">Edges</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-red-500" />
                <span className="text-xs text-gray-400">Shared Address</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-amber-500 border-dashed" />
                <span className="text-xs text-gray-400">Shared Director</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <div className="card px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{filteredData.nodes.length}</p>
            <p className="text-xs text-gray-500">Vendors</p>
          </div>
          <div className="card px-3 py-2 text-center">
            <p className="text-lg font-bold text-red-400">{filteredData.links.length}</p>
            <p className="text-xs text-gray-500">Relations</p>
          </div>
          <div className="card px-3 py-2 text-center">
            <p className="text-lg font-bold text-amber-400">{filteredData.nodes.filter(n => n.flaggedCases > 0).length}</p>
            <p className="text-xs text-gray-500">Flagged</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Building vendor relationship graph...</p>
            </div>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={filteredData}
            nodeLabel={(n: any) => `${n.name}\nRisk: ${n.riskScore}/100\nContracts: ${n.totalContracts}`}
            nodeColor={(n: any) => n.color}
            nodeVal={(n: any) => n.val}
            linkColor={(l: any) => l.color}
            linkWidth={(l: any) => l.width}
            linkLineDash={(l: any) => l.dashed ? [3, 3] : null}
            backgroundColor="#030712"
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              if (globalScale < 2) return;
              const label = node.name.split(' ')[0];
              const fontSize = 10 / globalScale;
              ctx.font = `${fontSize}px Inter`;
              ctx.fillStyle = 'rgba(255,255,255,0.8)';
              ctx.textAlign = 'center';
              ctx.fillText(label, node.x!, node.y! + 8 / globalScale);
            }}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            width={window.innerWidth - (selectedVendor ? 560 : 240)}
            height={window.innerHeight - 100}
          />
        )}
      </div>

      {/* Vendor Profile Panel */}
      {selectedVendor && (
        <div className="w-80 flex-shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto animate-slide-in-right">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Vendor Profile</h3>
              <button onClick={() => setSelectedVendor(null)} className="btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="p-4 bg-gray-800/60 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <RiskBadge level={getRiskLevel(selectedVendor.riskScore) as any} score={selectedVendor.riskScore} showScore />
                </div>
                <h4 className="text-sm font-semibold text-white">{selectedVendor.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedVendor.registrationNumber}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Award, label: 'Total Contracts', value: selectedVendor.totalContracts, color: 'text-accent-400' },
                  { icon: AlertTriangle, label: 'Flagged Cases', value: selectedVendor.summary?.flaggedCases || 0, color: 'text-red-400' },
                  { icon: TrendingUp, label: 'Win Rate', value: `${Math.round((selectedVendor.winRate || 0) * 100)}%`, color: 'text-green-400' },
                  { icon: TrendingUp, label: 'Total Value', value: `₹${((selectedVendor.totalContractsValue || 0) / 100).toFixed(0)}Cr`, color: 'text-amber-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="p-2.5 bg-gray-800/40 rounded-lg">
                    <Icon className={`w-3.5 h-3.5 ${color} mb-1`} />
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="p-3 bg-gray-800/40 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-300">{selectedVendor.address}</p>
                    <p className="text-xs text-gray-400">{selectedVendor.city}, {selectedVendor.state}</p>
                  </div>
                </div>
              </div>

              {/* Directors */}
              <div className="p-3 bg-gray-800/40 rounded-lg">
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Directors</p>
                    {selectedVendor.directors?.map(d => (
                      <p key={d} className="text-xs text-gray-200">{d}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Procurement Categories</p>
                <div className="flex flex-wrap gap-1">
                  {selectedVendor.category?.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">{c}</span>
                  ))}
                </div>
              </div>

              {/* Recent Cases */}
              {selectedVendor.cases && selectedVendor.cases.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Recent Cases</p>
                  <div className="space-y-1.5">
                    {selectedVendor.cases.slice(0, 5).map(c => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/cases/${c.id.replace('CASE-', '')}`)}
                        className="w-full text-left p-2.5 bg-gray-800/40 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-accent-400">{c.id}</span>
                          <RiskBadge level={c.riskLevel as any} size="sm" />
                        </div>
                        <p className="text-xs text-gray-300 truncate mt-0.5">{c.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
