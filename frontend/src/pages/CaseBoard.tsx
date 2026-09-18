import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, performCaseAction, CaseSummary } from '../api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { GripVertical, User, ChevronRight } from 'lucide-react';

const COLUMNS = [
  { key: 'new', label: 'New', color: 'border-indigo-800/40', headerColor: 'bg-indigo-950/30 text-indigo-300' },
  { key: 'under_review', label: 'Under Review', color: 'border-amber-800/40', headerColor: 'bg-amber-950/30 text-amber-300' },
  { key: 'escalated', label: 'Escalated', color: 'border-red-800/40', headerColor: 'bg-red-950/30 text-red-300' },
  { key: 'resolved', label: 'Resolved', color: 'border-green-800/40', headerColor: 'bg-green-950/30 text-green-300' },
] as const;

type ColKey = typeof COLUMNS[number]['key'];

function CaseCard({ c, onMove }: { c: CaseSummary; onMove: (id: string, status: ColKey) => void }) {
  const navigate = useNavigate();
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2 hover:border-gray-700 transition-all duration-150 cursor-pointer group relative"
      onClick={() => navigate(`/cases/${c.id.replace('CASE-', '')}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-accent-400">{c.id}</span>
        <RiskBadge level={c.riskLevel} size="sm" />
      </div>
      <p className="text-xs font-medium text-gray-200 leading-tight line-clamp-2">{c.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{c.department}</span>
        <span className="text-xs text-gray-400">₹{c.awardedValue?.toLocaleString() || '—'} L</span>
      </div>
      {c.assignee && (
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-accent-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
            {c.assignee[0]}
          </div>
          <span className="text-xs text-gray-500 truncate">{c.assignee}</span>
        </div>
      )}
      <div
        onClick={e => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
      >
        <button className="btn-ghost text-xs p-1 text-gray-500 hover:text-gray-200">⋮</button>
        {showMoveMenu && (
          <div className="absolute right-0 top-6 z-20 bg-gray-800 border border-gray-700 rounded-lg py-1 w-36 shadow-xl">
            {COLUMNS.filter(col => col.key !== c.caseStatus).map(col => (
              <button
                key={col.key}
                onClick={e => { e.stopPropagation(); onMove(c.id, col.key); setShowMoveMenu(false); }}
                className="block w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Move to {col.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CaseBoard() {
  const [board, setBoard] = useState<Record<ColKey, CaseSummary[]>>({
    new: [], under_review: [], escalated: [], resolved: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases({ flaggedOnly: true, limit: 100 })
      .then(({ data }) => {
        const grouped: Record<ColKey, CaseSummary[]> = { new: [], under_review: [], escalated: [], resolved: [] };
        data.forEach(c => {
          if (grouped[c.caseStatus as ColKey]) grouped[c.caseStatus as ColKey].push(c);
        });
        setBoard(grouped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMove = async (caseId: string, newStatus: ColKey) => {
    const fromStatus = Object.entries(board).find(([, cases]) => cases.some(c => c.id === caseId))?.[0] as ColKey;
    if (!fromStatus || fromStatus === newStatus) return;

    const actionMap: Record<ColKey, string> = {
      new: 'review',
      under_review: 'review',
      escalated: 'escalate',
      resolved: 'dismiss',
    };

    await performCaseAction(caseId, actionMap[newStatus], { reason: 'Moved via board' }, 'Admin');

    setBoard(prev => {
      const caseToMove = prev[fromStatus].find(c => c.id === caseId)!;
      return {
        ...prev,
        [fromStatus]: prev[fromStatus].filter(c => c.id !== caseId),
        [newStatus]: [...prev[newStatus], { ...caseToMove, caseStatus: newStatus }],
      };
    });
  };

  const totalFlagged = Object.values(board).flat().length;

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Case Management Board</h2>
          <p className="text-xs text-gray-500 mt-0.5">{totalFlagged} flagged cases across {COLUMNS.length} stages</p>
        </div>
        <div className="flex gap-2">
          {COLUMNS.map(col => (
            <div key={col.key} className="text-center">
              <p className="text-sm font-bold text-white">{loading ? '—' : board[col.key].length}</p>
              <p className="text-xs text-gray-500">{col.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Board columns */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <div key={col.key} className={`flex-1 min-w-64 flex flex-col border rounded-xl ${col.color} bg-gray-900/30`}>
            {/* Column header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.headerColor} border-b border-current/20`}>
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full">
                {loading ? '—' : board[col.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
                  ))
                : board[col.key].map(c => (
                    <CaseCard key={c.id} c={c} onMove={handleMove} />
                  ))
              }
              {!loading && board[col.key].length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg">
                  No cases in {col.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
