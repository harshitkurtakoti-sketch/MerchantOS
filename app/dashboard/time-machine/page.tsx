'use client';

import { useEffect, useState, useCallback } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, ComposedChart, ReferenceLine } from 'recharts';
import { LineChart as LineIcon, AlertTriangle, RefreshCw, Sliders } from 'lucide-react';
import { ForecastPoint } from '@/lib/db/types';

interface TimeMachineForecast {
  horizon_days: number;
  safety_threshold: number;
  has_cash_stress: boolean;
  cash_stress_dates: string[];
  points: ForecastPoint[];
}

export default function TimeMachinePage() {
  const [horizon, setHorizon] = useState(90);
  const [salesDelta, setSalesDelta] = useState(0);
  const [inventoryPurchase, setInventoryPurchase] = useState(0);
  const [priceDelta, setPriceDelta] = useState(0);
  const [forecast, setForecast] = useState<TimeMachineForecast | null>(null);

  const fetchForecast = useCallback(() => {
    fetch('/api/business/biz_rukmini_store/time-machine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horizon_days: horizon,
        assumptions: {
          sales_change_pct: salesDelta,
          inventory_purchase_amount: inventoryPurchase,
          price_change_pct: priceDelta,
        },
      }),
    })
      .then(r => r.json())
      .then(setForecast);
  }, [horizon, salesDelta, inventoryPurchase, priceDelta]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <LineIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" /> Financial Time Machine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate future cash trajectories. Move assumption sliders to see cash-stress dips recompute live.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/80 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          {[30, 60, 90, 180].map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                horizon === h ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {forecast?.has_cash_stress && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-rose-900">Cash Stress Warning Detected</div>
            <div className="text-xs text-rose-800 mt-0.5">
              Under these assumptions, projected cash drops below your safety threshold (₹{forecast.safety_threshold.toLocaleString('en-IN')}) on {forecast.cash_stress_dates.length} days.
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Projected Cash Trajectory (₹ INR)</span>
          <span className="text-xs text-slate-500 font-semibold">Safety Floor: ₹{forecast?.safety_threshold?.toLocaleString('en-IN')}</span>
        </div>

        <div className="h-64 sm:h-80 w-full pt-2 sm:pt-4">
          {forecast?.points ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.points}>
                <defs>
                  <linearGradient id="cashGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val: unknown) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <ReferenceLine y={forecast.safety_threshold} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Safety Floor', fill: '#dc2626', fontSize: 10, fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#059669" fillOpacity={0.08} />
                <Area type="monotone" dataKey="projected_cash" stroke="#059669" strokeWidth={3} fill="url(#cashGradLight)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading chart...</div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-600 shrink-0" /> Interactive Time Machine Sliders
          </div>
          <button
            onClick={() => {
              setSalesDelta(0);
              setInventoryPurchase(0);
              setPriceDelta(0);
            }}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Sales Change (%)</span>
              <span className={`font-extrabold ${salesDelta >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {salesDelta > 0 ? `+${salesDelta}%` : `${salesDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={salesDelta}
              onChange={e => setSalesDelta(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Inventory Purchase (₹)</span>
              <span className="font-extrabold text-amber-700">₹{inventoryPurchase.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="25000"
              value={inventoryPurchase}
              onChange={e => setInventoryPurchase(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-semibold">Price Change (%)</span>
              <span className={`font-extrabold ${priceDelta >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              value={priceDelta}
              onChange={e => setPriceDelta(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

