'use client';

import { useEffect, useState } from 'react';
import { Calculator, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { LoanScenarioResult } from '@/lib/engines/loan_simulator';

export default function LoanSimulatorPage() {
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(14.0);
  const [tenure, setTenure] = useState(12);
  const [simRes, setSimRes] = useState<any>(null);

  const runSim = () => {
    fetch('/api/business/biz_rukmini_store/loan-simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loan_amount: amount,
        interest_rate: interest,
        tenure_months: tenure,
      }),
    })
      .then(r => r.json())
      .then(setSimRes);
  };

  useEffect(() => {
    runSim();
  }, [amount, interest, tenure]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-400" /> Reverse Loan Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Instead of asking "will I be approved", see what happens to your cash flow if you take a working-capital loan.
        </p>
      </div>

      {/* Inputs Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Loan Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Loan Amount (₹)</span>
              <span className="font-bold text-emerald-400">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="100000" max="2000000" step="50000" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Interest Rate (% p.a.)</span>
              <span className="font-bold text-amber-400">{interest}%</span>
            </div>
            <input type="range" min="8" max="24" step="0.5" value={interest} onChange={e => setInterest(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Tenure (Months)</span>
              <span className="font-bold text-cyan-400">{tenure} Months</span>
            </div>
            <input type="range" min="6" max="36" step="6" value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full accent-cyan-500 cursor-pointer" />
          </div>
        </div>

        {simRes && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div>
              Monthly Repayment (EMI): <span className="font-bold text-white text-sm">₹{simRes.monthly_emi.toLocaleString('en-IN')}</span>
            </div>
            <div>
              Total Interest Payable: <span className="font-semibold text-amber-400">₹{simRes.total_interest_payable.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Allocation Scenarios Comparison Grid */}
      {simRes?.scenarios && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {simRes.scenarios.map((sc: LoanScenarioResult, idx: number) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Scenario {idx + 1}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{sc.scenario_name}</h3>
                <p className="text-xs text-slate-400 mt-1">{sc.description}</p>

                {sc.warning_flag && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 mt-3 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{sc.warning_flag}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly EMI:</span>
                  <span className="font-bold text-white">₹{sc.monthly_emi.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repayment Pressure:</span>
                  <span className={`font-bold ${sc.repayment_pressure_pct > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sc.repayment_pressure_pct}% Cash Flow
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Break-Even:</span>
                  <span className="font-semibold text-white">Month {sc.break_even_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">End Cash Impact (Base):</span>
                  <span className="font-bold text-emerald-400">
                    +₹{sc.base_case.end_cash.diff.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
