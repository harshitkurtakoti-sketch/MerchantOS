'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Database,
  Upload,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
  DollarSign,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [businessName, setBusinessName] = useState("Rukmini's Kirana & General Store");
  const [category, setCategory] = useState('retail');
  const [monthlyTurnover, setMonthlyTurnover] = useState('450000');
  const [initialCash, setInitialCash] = useState('245000');
  const [monthlyOpex, setMonthlyOpex] = useState('89000');
  const [customerCreditDays, setCustomerCreditDays] = useState('14');
  const [supplierTermsDays, setSupplierTermsDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialCash || Number(initialCash) < 0) {
      setError('Please provide a valid initial cash balance');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleInitializeTwin = async (mode: 'demo' | 'custom' | 'import') => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'demo' || mode === 'custom') {
        // Seed base data
        const res = await fetch('/api/demo/seed', { method: 'POST' });
        const data = await res.json();

        // Calibrate twin with user parameters if custom
        if (mode === 'custom') {
          await fetch('/api/business/biz_rukmini_store/digital-twin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cash_adjustment: Number(initialCash) - 245000,
              customer_delay_days: Number(customerCreditDays),
              supplier_terms_days: Number(supplierTermsDays),
            }),
          });
        }

        if (data.success) {
          // Save twin setup state in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'merchantos_twin_profile',
              JSON.stringify({
                businessName,
                category,
                initialCash: Number(initialCash),
                customerCreditDays: Number(customerCreditDays),
                supplierTermsDays: Number(supplierTermsDays),
                initializedAt: new Date().toISOString(),
              })
            );
          }
          setStep(4);
        }
      } else if (mode === 'import') {
        router.push('/dashboard/import');
      }
    } catch (e) {
      console.error(e);
      setError('Initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex items-center justify-center p-3.5 sm:p-6 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                <Cpu className="w-3.5 h-3.5" />
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Setup MerchantOS Twin</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {step === 1 && 'Step 1 of 3: Business Identity & Category'}
              {step === 2 && 'Step 2 of 3: Financial Baseline & Operating Model'}
              {step === 3 && 'Step 3 of 3: Data Strategy & Initialization'}
              {step === 4 && 'Digital Twin Calibrated Successfully'}
            </p>
          </div>

          <Link
            href="/login"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0"
          >
            <Phone className="w-3 h-3 text-emerald-600" /> Phone OTP
          </Link>
        </div>

        {/* Stepper Progress */}
        {step < 4 && (
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= s ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
                <div className="text-[10px] font-bold text-slate-400 text-center hidden xs:block">
                  {s === 1 ? 'Profile' : s === 2 ? 'Finances' : 'Data'}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Step 1: Business Identity & Category */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Rukmini's Kirana & General Store"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
              >
                <option value="retail">Retail / Kirana / General Store</option>
                <option value="d2c">D2C / E-Commerce Brand</option>
                <option value="msme_manufacturing">MSME Manufacturing / Distribution</option>
                <option value="msme_services">MSME Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Monthly Turnover (₹)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthlyTurnover}
                  onChange={(e) => setMonthlyTurnover(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Continue to Financial Model <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Financial Model & Baseline */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Cash Balance (₹)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={initialCash}
                  onChange={(e) => setInitialCash(e.target.value)}
                  placeholder="e.g. 245000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Monthly OpEx Budget (₹)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthlyOpex}
                  onChange={(e) => setMonthlyOpex(e.target.value)}
                  placeholder="e.g. 89000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Payment Terms</label>
                <select
                  value={customerCreditDays}
                  onChange={(e) => setCustomerCreditDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                >
                  <option value="0">Cash on Delivery / Immediate (0 days)</option>
                  <option value="7">7 Days Credit</option>
                  <option value="14">14 Days Credit (Standard)</option>
                  <option value="30">30 Days Net Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Supplier Payment Terms</label>
                <select
                  value={supplierTermsDays}
                  onChange={(e) => setSupplierTermsDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                >
                  <option value="15">15 Days Payment Terms</option>
                  <option value="30">30 Days Payment Terms (Standard)</option>
                  <option value="45">45 Days Payment Terms</option>
                  <option value="60">60 Days Extended Terms</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                These baseline figures form the deterministic cash flow floor and safety buffer thresholds.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Continue to Initialization <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Data Strategy & Initialization Selection */}
        {step === 3 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Twin Initialization Source:
            </h2>

            <button
              onClick={() => handleInitializeTwin('custom')}
              disabled={loading}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500 hover:border-emerald-600 text-left transition-all group flex items-start justify-between shadow-xs"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    Calibrate Custom Twin ({businessName})
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                    Builds your twin with ₹{Number(initialCash).toLocaleString('en-IN')} cash balance, {category} catalog models, and 180 days of realistic history.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity mt-2 shrink-0" />
            </button>

            <button
              onClick={() => handleInitializeTwin('demo')}
              disabled={loading}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-all flex items-start gap-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">Standard Rukmini Kirana Preset</div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  15 verified SKUs, supplier concentration risk, loss leaders, and bank sanction models.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleInitializeTwin('import')}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-all flex items-start gap-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Upload className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">Import Custom CSV / OCR Bills</div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Upload your transaction spreadsheets or scan physical paper bills with camera OCR.
                </p>
              </div>
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
              >
                ← Back to Financial Baseline
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation State */}
        {step === 4 && (
          <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300 shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Digital Twin Created!</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your small business financial model is live with money, commerce, and behavior engines active.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Business:</span>
                <span className="font-extrabold text-slate-900">{businessName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-emerald-700 capitalize">{category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Calibrated Cash Floor:</span>
                <span className="font-extrabold text-slate-900">₹{Number(initialCash).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Cycle:</span>
                <span className="font-bold text-slate-700">{customerCreditDays}d cust. / {supplierTermsDays}d supp.</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              Open Command Center <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

