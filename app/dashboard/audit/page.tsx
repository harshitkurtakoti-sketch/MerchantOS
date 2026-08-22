'use client';

import { History, ShieldCheck } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 'aud_101', timestamp: '2026-08-19 18:14:02', action: 'AI_TOOL_EXECUTION', entity: 'run_scenario', user: 'Rukmini Devi', details: 'Executed inventory_purchase_amount=300000 simulation' },
  { id: 'aud_102', timestamp: '2026-08-19 18:10:15', action: 'HEALTH_SCORE_RECOMPUTE', entity: 'health_scores', user: 'System (Scheduled)', details: 'Recomputed health score to 81/100 across 180 days' },
  { id: 'aud_103', timestamp: '2026-08-19 17:45:00', action: 'DEMO_DATA_SEED', entity: 'businesses', user: 'Rukmini Devi', details: 'Initialized Rukmini Kirana & General Store dataset' },
  { id: 'aud_104', timestamp: '2026-08-19 16:30:22', action: 'RISK_EVENT_REVIEW', entity: 'risk_events', user: 'Rukmini Devi', details: 'Reviewed supplier concentration risk for Shree Laxmi Wholesalers' },
];

export default function AuditTrailPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Immutable Audit & Activity Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological evidence log of all financial mutations, scenario runs, and AI tool calls.
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Audit Stream</span>
          <span className="text-xs text-emerald-700 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Append-Only Immutable Storage
          </span>
        </div>

        <div className="space-y-2.5">
          {MOCK_AUDIT_LOGS.map(log => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                    {log.entity}
                  </span>
                </div>
                <div className="text-slate-600 text-xs break-words">{log.details}</div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end text-slate-500 text-[11px] pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0 shrink-0">
                <div className="text-slate-800 font-semibold">{log.user}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

