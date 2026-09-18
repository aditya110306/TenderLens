// API client for TenderLens backend
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

export interface KPIs {
  totalTenders: number;
  flaggedCases: number;
  totalContractValue: number;
  avgRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  changePercent: { flagged: number; value: number; risk: number };
}

export interface TrendPoint {
  month: string;
  total: number;
  flagged: number;
  critical: number;
}

export interface CaseSummary {
  id: string;
  tenderId: string;
  title: string;
  department: string;
  category: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clear';
  awardedValue: number | null;
  awardedTo: string | null;
  awardedToName: string | null;
  awardedAt: string | null;
  caseStatus: 'new' | 'under_review' | 'escalated' | 'resolved';
  assignee: string | null;
  flagged: boolean;
  signalCount: number;
  location: string;
  triggeredSignals?: string[];
}

export interface Signal {
  rule: string;
  label: string;
  description: string;
  triggered: boolean;
  score: number;
  maxScore: number;
  weight: number;
  evidence: string[];
}

export interface Bid {
  vendorId: string;
  vendorName: string;
  bidAmount: number;
  technicalScore: number;
  financialScore: number;
  isWinner: boolean;
  disqualified: boolean;
  notes?: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
}

export interface CaseDetail extends CaseSummary {
  description: string;
  referenceNo: string;
  publishedAt: string;
  closingDate: string;
  estimatedValue: number;
  status: string;
  signals: Signal[];
  notes: string[];
  auditTrail: AuditEntry[];
  bids: Bid[];
}

export interface VendorNode {
  id: string;
  name: string;
  riskScore: number;
  winRate: number;
  totalContracts: number;
  totalContractsValue: number;
  flaggedCases: number;
  category: string[];
  city: string;
  state: string;
  status: string;
}

export interface VendorEdge {
  source: string;
  target: string;
  type: 'shared_address' | 'shared_director' | 'co_bidder';
  label: string;
}

export interface VendorProfile extends VendorNode {
  registrationNumber: string;
  address: string;
  directors: string[];
  establishedYear: number;
  cases: CaseSummary[];
  summary: { totalCases: number; flaggedCases: number; totalValue: number; avgRiskScore: number };
}

export interface Report {
  reportId: string;
  generatedAt: string;
  generatedBy?: string;
  summary: {
    caseId: string;
    title: string;
    department: string;
    riskScore: number;
    riskLevel: string;
    caseStatus: string;
    assignee: string | null;
    referenceNo: string;
  };
  tenderDetails: {
    description: string;
    estimatedValue: number;
    awardedValue: number | null;
    publishedAt: string;
    closingDate: string;
    awardedAt: string | null;
    savingPercent: number;
  };
  vendorProfile: VendorProfile | null;
  signalBreakdown: Signal[];
  bidComparison: Bid[];
  timeline: { date: string; event: string; description: string }[];
  reviewerNotes: string[];
  recommendations: string[];
  disclaimer: string;
}

// Dashboard
export const getDashboardKPIs = () => api.get<KPIs>('/dashboard/kpis').then(r => r.data);
export const getDashboardTrend = () => api.get<TrendPoint[]>('/dashboard/trend').then(r => r.data);
export const getDashboardPriority = () => api.get<CaseSummary[]>('/dashboard/priority').then(r => r.data);

// Cases
export const getCases = (params?: Record<string, string | number | boolean>) =>
  api.get<{ total: number; data: CaseSummary[] }>('/cases', { params }).then(r => r.data);

export const getCase = (id: string) => api.get<CaseDetail>(`/cases/${id}`).then(r => r.data);

export const updateCase = (id: string, data: Partial<CaseSummary>) =>
  api.patch(`/cases/${id}`, data).then(r => r.data);

export const performCaseAction = (id: string, action: string, payload?: Record<string, string>, actor?: string) =>
  api.post(`/cases/${id}/actions`, { action, payload, actor }).then(r => r.data);

export const getKanbanBoard = () => api.get('/cases/kanban/board').then(r => r.data);

// Vendors
export const getVendorGraph = () =>
  api.get<{ nodes: VendorNode[]; edges: VendorEdge[] }>('/vendors').then(r => r.data);

export const getVendor = (id: string) => api.get<VendorProfile>(`/vendors/${id}`).then(r => r.data);

// Reports
export const getReport = (caseId: string) => api.get<Report>(`/reports/${caseId}`).then(r => r.data);

// Assistant
export const askAssistant = (query: string) =>
  api.post<{ response: string; relatedCases?: string[]; relatedVendors?: string[] }>('/assistant', { query }).then(r => r.data);

// Ingest
export const runIngestion = () => api.post('/ingest').then(r => r.data);

export default api;
