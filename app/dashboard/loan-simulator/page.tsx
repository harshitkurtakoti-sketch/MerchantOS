'use client';

import { useEffect, useState } from 'react';
import { Calculator, AlertTriangle, ArrowRight, ShieldCheck, Building, CheckCircle2, Sparkles, Clock, FileText } from 'lucide-react';
import { LoanScenarioResult, BankLenderMatch } from '@/lib/engines/loan_simulator';

export default function LoanSimulatorPage() {
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(14.0);
  const [tenure, setTenure] = useState(12);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [simRes, setSimRes] = useState<{
    monthly_emi: number;
    total_interest_payable: number;
    scenarios: LoanScenarioResult[];
    bank_matches: BankLenderMatch[];
  } | null>(null);

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

  const handleApplyBankRate = (bank: BankLenderMatch) => {
    setInterest(bank.indicative_interest_rate_pct);
    setSelectedBank(bank.bank_name);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Reverse Loan Simulator & Bank Sanction Matcher
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulate how working capital affects your cash flow and see which banks are prepared to sanction your loan with indicative rates.
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Loan Simulation Parameters</h2>
          {selectedBank && (
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              Rate Matched: {selectedBank}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Loan Amount (₹)</span>
              <span className="font-extrabold text-emerald-700">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="100000" max="2000000" step="50000" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Interest Rate (% p.a.)</span>
              <span className="font-extrabold text-amber-700">{interest}%</span>
            </div>
            <input type="range" min="8" max="24" step="0.25" value={interest} onChange={e => { setInterest(Number(e.target.value)); setSelectedBank(null); }} className="w-full accent-amber-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Tenure (Months)</span>
              <span className="font-extrabold text-teal-700">{tenure} Months</span>
            </div>
            <input type="range" min="6" max="36" step="6" value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
          </div>
        </div>

        {simRes && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
            <div>
              Monthly Repayment (EMI): <span className="font-extrabold text-slate-900 text-sm">₹{simRes.monthly_emi.toLocaleString('en-IN')}</span>
            </div>
            <div>
              Total Interest Payable: <span className="font-extrabold text-amber-700">₹{simRes.total_interest_payable.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {simRes?.scenarios && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">3 Capital Allocation Cash Projections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {simRes.scenarios.map((sc: LoanScenarioResult, idx: number) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Scenario {idx + 1}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-2">{sc.scenario_name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sc.description}</p>

                  {sc.warning_flag && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium mt-3 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{sc.warning_flag}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Monthly EMI:</span>
                    <span className="font-bold text-slate-900">₹{sc.monthly_emi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Repayment Pressure:</span>
                    <span className={`font-bold ${sc.repayment_pressure_pct > 40 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {sc.repayment_pressure_pct}% Cash Flow
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Est. Break-Even:</span>
                    <span className="font-bold text-slate-900">Month {sc.break_even_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">End Cash Impact (Base):</span>
                    <span className="font-extrabold text-emerald-700">
                      +₹{sc.base_case.end_cash.diff.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {simRes?.bank_matches && simRes.bank_matches.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" /> Bank Sanction & Interest Rate Matcher
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched against your 81/100 Financial Readiness Index, positive operating margins, and verified cash buffer.
              </p>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
              5 Lenders Matched
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simRes.bank_matches.map((bank, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  selectedBank === bank.bank_name
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{bank.bank_name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{bank.scheme_name}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      {bank.sanction_probability_pct}% Likelihood
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/70 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Indicative Rate</div>
                      <div className="font-extrabold text-emerald-700 text-sm mt-0.5">{bank.interest_rate_range}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Max Sanction</div>
                      <div className="font-extrabold text-slate-800 text-sm mt-0.5">₹{(bank.max_sanction_limit / 100000).toFixed(1)} Lakhs</div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Turnaround: <span className="font-bold text-slate-800">{bank.processing_turnaround_days}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-[11px] space-y-1 text-slate-600">
                    <div className="font-bold text-slate-700 text-[10px] uppercase">Approval Drivers:</div>
                    {bank.approval_drivers.slice(0, 2).map((d, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyBankRate(bank)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedBank === bank.bank_name
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedBank === bank.bank_name ? 'Active in Simulation' : `Test ${bank.indicative_interest_rate_pct}% Rate in Simulator`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

