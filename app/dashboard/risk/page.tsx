'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, FileText } from 'lucide-react';
import { RiskEvent } from '@/lib/db/types';

export default function RiskGraphPage() {
  const [events, setEvents] = useState<RiskEvent[]>([]);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/risk')
      .then(r => r.json())
      .then(d => setEvents(d.risk_events || []));
  }, []);

  const handleReview = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'reviewed' } : e));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" /> Risk Graph & Dependency Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Surfaces concentration and statistical anomaly risks with clear evidence backing. (Strict non-fraud terminology enforced).
        </p>
      </div>

      <div className="space-y-4">
        {events.map((e, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border transition-all ${
              e.status === 'reviewed'
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : e.severity === 'critical' || e.severity === 'high'
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{e.rule_triggered}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      e.severity === 'critical' ? 'bg-rose-500 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {e.severity} Severity
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Entity Type: {e.entity_type.toUpperCase()}</div>
                </div>
              </div>

              {e.status !== 'reviewed' ? (
                <button
                  onClick={() => handleReview(e.id)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 self-start md:self-auto"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Reviewed
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Reviewed & Acknowledged
                </span>
              )}
            </div>

            {/* Evidence Panel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Audit Evidence & Baseline Comparison:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400">
                {Object.entries(e.evidence).map(([k, v], i) => (
                  <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{k.replace('_', ' ')}</div>
                    <div className="text-white font-semibold mt-0.5 truncate">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
