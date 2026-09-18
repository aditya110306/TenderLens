import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface DemoStep {
  route: string;
  narration: string;
  delay: number;
  action?: () => void;
}

interface DemoContextType {
  demoActive: boolean;
  currentStep: number;
  narration: string;
  startDemo: () => void;
  stopDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  demoActive: false,
  currentStep: 0,
  narration: '',
  startDemo: () => {},
  stopDemo: () => {},
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [demoActive, setDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [narration, setNarration] = useState('');
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const DEMO_STEPS: DemoStep[] = [
    { route: '/ingestion', narration: '📤 Step 1: Uploading procurement dataset — watch the ingestion pipeline process 300 tenders...', delay: 0 },
    { route: '/ingestion', narration: '⚙️ Step 2: AI engine scoring all cases across 6 anomaly detection rules...', delay: 3500 },
    { route: '/cases', narration: '🚩 Step 3: Browsing flagged cases — 158 anomalies detected with risk scores 20-100...', delay: 3500 },
    { route: '/cases/001', narration: '🔍 Step 4: Deep-diving into Case #001 — Social Housing contract with 4 triggered signals...', delay: 3500 },
    { route: '/graph', narration: '🕸️ Step 5: Exploring vendor relationship graph — notice the shared-address cluster highlighted in red...', delay: 4000 },
    { route: '/board', narration: '📋 Step 6: Case management board — reviewing team assignments and escalation status...', delay: 3500 },
    { route: '/reports', narration: '📄 Step 7: Generating printable investigation report for senior stakeholders...', delay: 3000 },
    { route: '/', narration: '✅ Demo complete! TenderLens detected 158 anomalies across ₹4.2 Lakh Crore in procurement.', delay: 3000 },
  ];

  const clearTimeouts = () => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
  };

  const startDemo = useCallback(() => {
    setDemoActive(true);
    setCurrentStep(0);
    clearTimeouts();

    let cumDelay = 0;
    DEMO_STEPS.forEach((step, i) => {
      cumDelay += step.delay;
      const t = setTimeout(() => {
        setCurrentStep(i + 1);
        setNarration(step.narration);
        navigate(step.route);
        if (i === DEMO_STEPS.length - 1) {
          setTimeout(() => setDemoActive(false), 3000);
        }
      }, cumDelay);
      timeoutRef.current.push(t);
    });
  }, [navigate]);

  const stopDemo = useCallback(() => {
    clearTimeouts();
    setDemoActive(false);
    setCurrentStep(0);
    setNarration('');
  }, []);

  return (
    <DemoContext.Provider value={{ demoActive, currentStep, narration, startDemo, stopDemo }}>
      {children}
      {demoActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-slide-in-up">
          <div className="bg-navy-800 border border-accent-600/40 rounded-xl p-4 shadow-glow-blue">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {currentStep}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-200">{narration}</p>
                <div className="mt-2 flex gap-1">
                  {DEMO_STEPS.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-accent-500' : 'bg-gray-700'}`} />
                  ))}
                </div>
              </div>
              <button onClick={stopDemo} className="text-gray-500 hover:text-gray-300 text-xs flex-shrink-0">Skip</button>
            </div>
          </div>
        </div>
      )}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoContext);
}
