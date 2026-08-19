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
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" /> Risk Graph & Dependency Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Surfaces concentration and statistical anomaly risks with clear evidence backing. (Strict non-fraud terminology enforced).
        </p>
      </div>

      <div className="space-y-4">
        {events.map((e, idx) => (
          <div
            key={idx}
            className={`p-4 sm:p-6 rounded-2xl border transition-all shadow-sm ${
              e.status === 'reviewed'
                ? 'bg-slate-50/60 border-slate-200 opacity-70'
                : e.severity === 'critical' || e.severity === 'high'
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{e.rule_triggered}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                      e.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {e.severity} Severity
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Entity Type: {e.entity_type.toUpperCase()}</div>
                </div>
              </div>

              {e.status !== 'reviewed' ? (
                <button
                  onClick={() => handleReview(e.id)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 self-start md:self-auto shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Reviewed
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reviewed & Acknowledged
                </span>
              )}
            </div>



            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Audit Evidence & Baseline Comparison:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600">
                {Object.entries(e.evidence).map(([k, v], i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{k.replace('_', ' ')}</div>
                    <div className="text-slate-900 font-bold mt-0.5 truncate">{String(v)}</div>
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
