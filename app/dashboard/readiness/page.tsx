'use client';

import { useEffect, useState } from 'react';
import { Award, Info } from 'lucide-react';
import { FinanceReadinessSnapshot } from '@/lib/db/types';

export default function FinanceReadinessPage() {
  const [readiness, setReadiness] = useState<FinanceReadinessSnapshot | null>(null);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/finance-readiness')
      .then(r => r.json())
      .then(setReadiness);
  }, []);

  if (!readiness) {
    return <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Computing Financing Readiness Score...</div>;
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
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Financing Readiness Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Underwriting-grade financial readiness signal built from verified merchant behavior over time.
        </p>
      </div>


      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <span className="font-extrabold text-slate-900">FinTech Compliance Disclaimer:</span> MerchantOS provides decision support and readiness evaluation only. It does not originate loans, issue credit approvals, or guarantee financing. All credit decisions remain subject to formal underwriting by licensed institutions.
        </div>
      </div>


      <div className="p-5 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-full bg-emerald-50/50 border-4 border-emerald-500 shadow-xl shadow-emerald-500/10 shrink-0">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{readiness.score}</span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Financially Prepared
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Financing Readiness Index</h2>
            <p className="text-xs text-emerald-800 mt-1 max-w-md italic font-semibold leading-relaxed">
              &quot;{readiness.qualifying_statement}&quot;
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 w-full md:w-64">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Confidence Level:</span>
            <span className="font-bold text-emerald-700">{readiness.confidence}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Data Completeness:</span>
            <span className="font-bold text-slate-900">100% (180 Days)</span>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Underwriting Component Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">Weight: {item.weight}</div>
              </div>
              <span className="text-sm font-extrabold text-emerald-700">{item.score}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
