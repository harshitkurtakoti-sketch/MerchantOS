'use client';

import { History, ShieldCheck, Cpu } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 'aud_101', timestamp: '2026-08-19 18:14:02', action: 'AI_TOOL_EXECUTION', entity: 'run_scenario', user: 'Rukmini Devi', details: 'Executed inventory_purchase_amount=300000 simulation' },
  { id: 'aud_102', timestamp: '2026-08-19 18:10:15', action: 'HEALTH_SCORE_RECOMPUTE', entity: 'health_scores', user: 'System (Scheduled)', details: 'Recomputed health score to 81/100 across 180 days' },
  { id: 'aud_103', timestamp: '2026-08-19 17:45:00', action: 'DEMO_DATA_SEED', entity: 'businesses', user: 'Rukmini Devi', details: 'Initialized Rukmini Kirana & General Store dataset' },
  { id: 'aud_104', timestamp: '2026-08-19 16:30:22', action: 'RISK_EVENT_REVIEW', entity: 'risk_events', user: 'Rukmini Devi', details: 'Reviewed supplier concentration risk for Shree Laxmi Wholesalers' },
];

export default function AuditTrailPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" /> Immutable Audit & Activity Log
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological evidence log of all financial mutations, scenario runs, and AI tool calls.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audit Stream</span>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Append-Only Immutable Storage
          </span>
        </div>

        <div className="space-y-2">
          {MOCK_AUDIT_LOGS.map(log => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{log.entity}</span>
                </div>
                <div className="text-slate-400 mt-0.5">{log.details}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-slate-300 font-medium">{log.user}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
