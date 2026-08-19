'use client';

import { Settings, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Settings & Prototype Boundary
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage business configuration, team access roles, and system boundaries.
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border border-emerald-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" /> Prototype Boundary Statement
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          "This is a prototype. MerchantOS does not currently access your real bank, GST, or payment data. All figures are based on data you import or enter, or on demo data."
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Business Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Business Name</div>
            <div className="text-slate-900 font-bold mt-1 text-sm">Rukmini's Kirana & General Store</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Category</div>
            <div className="text-slate-900 font-bold mt-1 text-sm">Retail / Kirana / Staples</div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Role-Based Access Control (RBAC)</span>
          <span className="text-xs text-slate-500 font-medium">1 Active Member</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div>
            <div className="font-bold text-slate-900">Rukmini Devi (Owner)</div>
            <div className="text-slate-500">rukmini@kirana.store</div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-extrabold uppercase self-start sm:self-auto">
            Owner Role
          </span>
        </div>
      </div>
    </div>
  );
}

