'use client';

import { useEffect, useState } from 'react';
import { Award, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { FinanceReadinessSnapshot } from '@/lib/db/types';

export default function FinanceReadinessPage() {
  const [readiness, setReadiness] = useState<FinanceReadinessSnapshot | null>(null);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/finance-readiness')
      .then(r => r.json())
      .then(setReadiness);
  }, []);

  if (!readiness) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Computing Financing Readiness Score...</div>;
  }

  const subItems = [
    { name: 'Cash Flow Stability', weight: '20%', score: readiness.sub_scores.cash_flow_stability },
    { name: 'Revenue Consistency', weight: '20%', score: readiness.sub_scores.revenue_consistency },
    { name: 'Profitability', weight: '15%', score: readiness.sub_scores.profitability },
    { name: 'Receivables Quality', weight: '15%', score: readiness.sub_scores.receivables_quality },
    { name: 'Inventory Health', weight: '10%', score: readiness.sub_scores.inventory_health },
    { name: 'Growth Trend', weight: '10%', score: readiness.sub_scores.growth_trend },
    { name: 'Debt Burden (Inverted)', weight: '5%', score: readiness.sub_scores.debt_burden },
    { name: 'Payment Behavior (Inverted)', weight: '5%', score: readiness.sub_scores.payment_behavior },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-400" /> Financing Readiness Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Underwriting-grade financial readiness signal built from verified merchant behavior over time.
        </p>
      </div>

      {/* Mandatory Non-Committal Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">FinTech Compliance Disclaimer:</span> MerchantOS provides decision support and readiness evaluation only. It does not originate loans, issue credit approvals, or guarantee financing. All credit decisions remain subject to formal underwriting by licensed institutions.
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500 shadow-xl shadow-emerald-500/10">
            <div className="text-center">
              <span className="text-4xl font-black text-white">{readiness.score}</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Financially Prepared
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Financing Readiness Index</h2>
            <p className="text-xs text-emerald-300/90 mt-1 max-w-md italic font-medium">
              "{readiness.qualifying_statement}"
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 w-full md:w-64">
          <div className="flex justify-between">
            <span className="text-slate-400">Confidence Level:</span>
            <span className="font-bold text-emerald-400">{readiness.confidence}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Data Completeness:</span>
            <span className="font-semibold text-white">100% (180 Days)</span>
          </div>
        </div>
      </div>

      {/* Sub-score breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Underwriting Component Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{item.name}</div>
                <div className="text-[10px] text-slate-500">Weight: {item.weight}</div>
              </div>
              <span className="text-sm font-black text-emerald-400">{item.score}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
