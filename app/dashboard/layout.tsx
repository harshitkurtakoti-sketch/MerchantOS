'use client';

import { ReactNode, useState } from 'react';
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
  Sparkles,
  Plus,
  FileText
} from 'lucide-react';
import { QuickCreateModal } from '@/components/QuickCreateModal';

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
  { label: 'Reports & PDF Export', href: '/dashboard/reports', icon: FileText },
  { label: 'Data Import', href: '/dashboard/import', icon: Upload },
  { label: 'Audit Trail', href: '/dashboard/audit', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex font-sans selection:bg-emerald-500 selection:text-white">
      {/* Quick Create Entry Modal */}
      <QuickCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Trigger a page refresh to update all twin engine states
          window.location.reload();
        }}
      />

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col fixed inset-y-0 z-40 shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Cpu className="w-4 h-4 text-white font-bold" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Merchant<span className="text-emerald-600">OS</span>
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
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 shadow-xs'
                    : item.highlight
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/70 hover:border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Business Selector Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">Rukmini's Kirana Store</div>
              <div className="text-[10px] text-slate-500 truncate font-mono">ID: biz_rukmini_store</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Data State:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
              Live Twin Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Real Entry
            </button>

            <Link
              href="/dashboard/agent"
              className="text-xs bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Ask MerchantOS AI
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
