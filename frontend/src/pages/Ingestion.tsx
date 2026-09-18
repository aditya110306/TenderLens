import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Database, Activity, Zap, TrendingUp } from 'lucide-react';
import { runIngestion } from '../api';

type Stage = 'idle' | 'uploading' | 'parsing' | 'validating' | 'scoring' | 'complete' | 'error';

const STAGES: { key: Stage; label: string; duration: number }[] = [
  { key: 'uploading',  label: 'Receiving Data',     duration: 800 },
  { key: 'parsing',   label: 'Parsing Records',     duration: 1000 },
  { key: 'validating',label: 'Validating Schema',   duration: 800 },
  { key: 'scoring',   label: 'Running Anomaly Engine', duration: 1200 },
  { key: 'complete',  label: 'Ingestion Complete',  duration: 0 },
];

export default function Ingestion() {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef(0);

  const runIngestionFlow = useCallback(async (name: string) => {
    setFileName(name);
    setStage('uploading');
    setProgress(0);
    setResult(null);

    for (let i = 0; i < STAGES.length - 1; i++) {
      setCurrentStageIdx(i);
      const stg = STAGES[i];
      setStage(stg.key);

      // Animate progress for this stage
      const stageStart = (i / (STAGES.length - 1)) * 85;
      const stageEnd = ((i + 1) / (STAGES.length - 1)) * 85;
      const steps = 20;
      for (let s = 0; s <= steps; s++) {
        await new Promise(r => setTimeout(r, stg.duration / steps));
        setProgress(Math.round(stageStart + (stageEnd - stageStart) * (s / steps)));
      }
    }

    // Final API call
    try {
      const data = await runIngestion();
      setResult(data);
      setProgress(100);
      setStage('complete');
      setCurrentStageIdx(STAGES.length - 1);
    } catch {
      setStage('error');
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) runIngestionFlow(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runIngestionFlow(file.name);
  };

  // Pre-populate on load (seed data already loaded)
  useEffect(() => {
    // Show pre-loaded status
  }, []);

  const reset = () => {
    setStage('idle');
    setProgress(0);
    setFileName(null);
    setResult(null);
    setCurrentStageIdx(0);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white">Data Ingestion Pipeline</h2>
        <p className="text-xs text-gray-500 mt-0.5">Upload procurement datasets or use pre-loaded seed data</p>
      </div>

      {/* Pre-loaded status banner */}
      <div className="card border-green-900/30 p-4 flex items-center gap-4">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-300">Seed Dataset Loaded</p>
          <p className="text-xs text-gray-400">289 awarded contracts scored · 158 anomalies detected · Dataset: FY 2024-25 Procurement Records</p>
        </div>
        <div className="flex gap-6 text-center">
          {[
            { label: 'Tenders', value: '300' },
            { label: 'Vendors', value: '80' },
            { label: 'Bids', value: '~650' },
            { label: 'Flagged', value: '158' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        id="drop-zone"
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => stage === 'idle' && fileInputRef.current?.click()}
        className={`card border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-accent-500 bg-accent-600/10 shadow-glow-blue' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'}
          ${stage !== 'idle' ? 'cursor-default' : ''}
        `}
      >
        <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx" onChange={handleFileSelect} className="hidden" />

        {stage === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-accent-600/10 border border-accent-600/20 flex items-center justify-center">
              <Upload className="w-7 h-7 text-accent-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-200">Drop procurement dataset here</p>
              <p className="text-sm text-gray-500 mt-1">Supports CSV, JSON, XLSX · Max 50MB</p>
              <p className="text-xs text-gray-600 mt-2">Or click to browse files</p>
            </div>
            <div className="flex gap-3 mt-2">
              {['CSV', 'JSON', 'XLSX'].map(fmt => (
                <span key={fmt} className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg font-mono">.{fmt.toLowerCase()}</span>
              ))}
            </div>
          </>
        )}

        {stage !== 'idle' && stage !== 'complete' && stage !== 'error' && (
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Activity className="w-5 h-5 text-accent-400 animate-spin-slow" />
              <span className="text-sm font-medium text-gray-200">{fileName}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{STAGES[currentStageIdx]?.label}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stage steps */}
            <div className="grid grid-cols-4 gap-2">
              {STAGES.slice(0, -1).map((s, i) => (
                <div key={s.key} className={`flex flex-col items-center gap-1.5 ${i <= currentStageIdx ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300
                    ${i < currentStageIdx ? 'bg-green-600 border-green-600' :
                      i === currentStageIdx ? 'border-accent-500 bg-accent-600/20' :
                      'border-gray-700 bg-gray-800'}`}>
                    {i < currentStageIdx ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : i === currentStageIdx ? (
                      <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs text-gray-500">{i + 1}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'complete' && result && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-900/30 border border-green-700/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-green-300">Ingestion Complete</p>
              <p className="text-xs text-gray-400 mt-1">All records processed and scored successfully</p>
            </div>
            <button onClick={reset} className="btn-secondary text-xs">Upload Another Dataset</button>
          </div>
        )}

        {stage === 'error' && (
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <p className="text-sm text-red-300">Processing failed. Please try again.</p>
            <button onClick={reset} className="btn-secondary text-xs">Retry</button>
          </div>
        )}
      </div>

      {/* Ingestion Summary (shown after complete) */}
      {(stage === 'complete' && result) && (
        <div className="grid grid-cols-4 gap-4 animate-slide-in-up">
          {[
            { icon: FileText, label: 'Records Processed', value: result.processed, color: 'text-accent-400', bg: 'bg-accent-600/10 border-accent-600/20' },
            { icon: Database, label: 'Vendors Registered', value: result.vendors, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/30' },
            { icon: Activity, label: 'Bids Analysed', value: result.bids, color: 'text-violet-400', bg: 'bg-violet-900/20 border-violet-800/30' },
            { icon: AlertCircle, label: 'Anomalies Flagged', value: result.flagged, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/30' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`card border p-5 flex items-center gap-4 ${bg}`}>
              <div className={`p-3 rounded-xl bg-gray-800 ${color}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supported Formats */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Supported Data Formats</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: FileText, format: 'GovTech Tender XML', desc: 'GeM standard export format' },
            { icon: Database, format: 'CPP Portal CSV', desc: 'Central Public Procurement export' },
            { icon: Zap, format: 'PFMS JSON Feed', desc: 'Payment tracking integration' },
          ].map(({ icon: Icon, format, desc }) => (
            <div key={format} className="flex items-start gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-800">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-300">{format}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
