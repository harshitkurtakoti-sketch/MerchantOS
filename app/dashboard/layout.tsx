'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HeartPulse,
  Cpu,
  LineChart,
  Layers,
  ShoppingBag,
  AlertTriangle,
  Award,
  Calculator,
  MessageSquare,
  Upload,
  History,
  Settings,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Ask AI Co-Pilot', href: '/dashboard/agent', icon: MessageSquare, highlight: true },
  { label: 'Financial Health', href: '/dashboard/health', icon: HeartPulse },
  { label: 'Time Machine', href: '/dashboard/time-machine', icon: LineChart },
  { label: 'Scenario Simulator', href: '/dashboard/scenarios', icon: Layers },
  { label: 'Commerce Intelligence', href: '/dashboard/commerce', icon: ShoppingBag },
  { label: 'Digital Twin', href: '/dashboard/twin', icon: Cpu },
  { label: 'Risk Graph', href: '/dashboard/risk', icon: AlertTriangle },
  { label: 'Finance Readiness', href: '/dashboard/readiness', icon: Award },
  { label: 'Reverse Loan Simulator', href: '/dashboard/loan-simulator', icon: Calculator },
  { label: 'Data Import', href: '/dashboard/import', icon: Upload },
  { label: 'Audit Trail', href: '/dashboard/audit', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed inset-y-0 z-40">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Cpu className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Merchant<span className="text-emerald-400">OS</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : item.highlight
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Business Selector Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">Rukmini's Kirana Store</div>
              <div className="text-[10px] text-slate-400 truncate">ID: biz_rukmini_store</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Prototype Data Boundary:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
              Synthetic Sandbox Data
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/agent"
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Ask MerchantOS AI
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
