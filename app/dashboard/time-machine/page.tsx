'use client';

import { useEffect, useState } from 'react';
import { LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, ComposedChart, ReferenceLine } from 'recharts';
import { LineChart as LineIcon, AlertTriangle, RefreshCw, Sliders } from 'lucide-react';

export default function TimeMachinePage() {
  const [horizon, setHorizon] = useState(90);
  const [salesDelta, setSalesDelta] = useState(0);
  const [inventoryPurchase, setInventoryPurchase] = useState(0);
  const [priceDelta, setPriceDelta] = useState(0);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = () => {
    setLoading(true);
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
      .then(data => {
        setForecast(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchForecast();
  }, [horizon, salesDelta, inventoryPurchase, priceDelta]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <LineIcon className="w-6 h-6 text-emerald-400" /> Financial Time Machine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate future cash trajectories. Move assumption sliders to see cash-stress dips recompute live.
          </p>
        </div>

        {/* Horizon Presets */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          {[30, 60, 90, 180].map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                horizon === h ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Cash Stress Alert Warning */}
      {forecast?.has_cash_stress && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-300">Cash Stress Warning Detected</div>
            <div className="text-xs text-rose-200/80 mt-0.5">
              Under these assumptions, projected cash drops below your safety threshold (₹{forecast.safety_threshold.toLocaleString('en-IN')}) on {forecast.cash_stress_dates.length} days.
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Projected Cash Trajectory (₹ INR)</span>
          <span className="text-xs text-slate-400">Safety Floor: ₹{forecast?.safety_threshold?.toLocaleString('en-IN')}</span>
        </div>

        <div className="h-80 w-full pt-4">
          {forecast?.points ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.points}>
                <defs>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <ReferenceLine y={forecast.safety_threshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Safety Floor', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#10b981" fillOpacity={0.08} />
                <Area type="monotone" dataKey="projected_cash" stroke="#10b981" strokeWidth={3} fill="url(#cashGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Assumption Sliders */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" /> Interactive Time Machine Sliders
          </div>
          <button
            onClick={() => {
              setSalesDelta(0);
              setInventoryPurchase(0);
              setPriceDelta(0);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Sliders
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Sales Change (%)</span>
              <span className={`font-bold ${salesDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {salesDelta > 0 ? `+${salesDelta}%` : `${salesDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={salesDelta}
              onChange={e => setSalesDelta(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Inventory Purchase Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Inventory Purchase (₹)</span>
              <span className="font-bold text-amber-400">₹{inventoryPurchase.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="25000"
              value={inventoryPurchase}
              onChange={e => setInventoryPurchase(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Price Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Price Change (%)</span>
              <span className={`font-bold ${priceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              value={priceDelta}
              onChange={e => setPriceDelta(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
