'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Printer, ShieldCheck, HeartPulse, Award, ShoppingBag, Layers } from 'lucide-react';

export default function ReportsPage() {
  const [health, setHealth] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/business/biz_rukmini_store/financial-health').then(r => r.json()).then(setHealth);
    fetch('/api/business/biz_rukmini_store/finance-readiness').then(r => r.json()).then(setReadiness);
    fetch('/api/business/biz_rukmini_store/commerce/profitability').then(r => r.json()).then(d => setProducts(d.products || []));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Notes\n"
      + `Health Score,${health?.score || 81},Audited 180-Day History\n`
      + `Financing Readiness Score,${readiness?.score || 87},Appears Prepared\n`
      + `Active Products Analyzed,${products.length},Commerce Intelligence Engine\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MerchantOS_Financial_Executive_Report.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> Exportable Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate print-ready PDF summaries of Health, Margins, and Financing Readiness for accountants or lenders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export CSV Data
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-lg space-y-8 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">MerchantOS Executive Financial Brief</div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Rukmini's Kirana & General Store</h2>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">Report Generated: {new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Audited Deterministic Twin Data
            </span>
          </div>
        </div>

        {/* Section 1: Health & Readiness Overview */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
              <HeartPulse className="w-4 h-4 text-emerald-600" /> Business Health Score
            </div>
            <div className="text-3xl font-black text-slate-900">{health?.score || 81} / 100</div>
            <div className="text-xs text-emerald-700 font-semibold">Status: Healthy (180-Day Window)</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
              <Award className="w-4 h-4 text-emerald-600" /> Financing Readiness Index
            </div>
            <div className="text-3xl font-black text-slate-900">{readiness?.score || 87} / 100</div>
            <div className="text-xs text-emerald-700 font-semibold">Appears Prepared for Financing</div>
          </div>
        </div>

        {/* Section 2: Product Margin Highlights */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" /> SKU Contribution Margin Summary
          </h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Retail Price</th>
                <th className="py-2.5 px-3">Product Cost</th>
                <th className="py-2.5 px-3">True Contribution Margin</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.slice(0, 5).map((p, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">{p.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">₹{p.selling_price}</td>
                  <td className="py-2.5 px-3 text-slate-600">₹{p.cost_price}</td>
                  <td className={`py-2.5 px-3 font-extrabold ${p.true_contribution_margin >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ₹{p.true_contribution_margin} ({p.contribution_margin_pct}%)
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {p.is_losing_money ? <span className="text-rose-600">Loss Leader</span> : <span className="text-emerald-700">Profitable</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">FinTech & Underwriting Disclosure:</p>
          <p>This report is generated deterministically by MerchantOS based on data entered or simulated. MerchantOS is a decision-support system and does not issue credit approvals or financial guarantees.</p>
        </div>
      </div>
    </div>
  );
}
