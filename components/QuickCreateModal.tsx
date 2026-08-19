'use client';

import { useState } from 'react';
import { Plus, X, CheckCircle2 } from 'lucide-react';

interface QuickCreateModalProps {
  businessId?: string;
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCreateModal({ businessId = 'biz_rukmini_store', onSuccess, isOpen, onClose }: QuickCreateModalProps) {
  const [activeTab, setActiveTab] = useState<'transaction' | 'product' | 'receivable'>('transaction');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [txnType, setTxnType] = useState<'income' | 'expense'>('income');
  const [txnCategory, setTxnCategory] = useState('Sales');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnCounterparty, setTxnCounterparty] = useState('');
  const [txnPaymentMethod, setTxnPaymentMethod] = useState('upi');

  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState('Staples');
  const [prodCostPrice, setProdCostPrice] = useState('');
  const [prodSellingPrice, setProdSellingPrice] = useState('');

  const [recType, setRecType] = useState<'receivable' | 'payable'>('receivable');
  const [recInvoiceRef, setRecInvoiceRef] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCounterparty, setRecCounterparty] = useState('');
  const [recDueDate, setRecDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/${businessId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txnType,
          category: txnCategory,
          amount: Number(txnAmount),
          counterparty: txnCounterparty || 'General Counterparty',
          payment_method: txnPaymentMethod,
          transaction_date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSuccessMsg('Transaction added! Engines recomputed live.');
        setTimeout(() => {
          setSuccessMsg('');
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSellingPrice) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/${businessId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName,
          sku: prodSku || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
          category: prodCategory,
          cost_price: Number(prodCostPrice || 0),
          selling_price: Number(prodSellingPrice),
        }),
      });
      if (res.ok) {
        setSuccessMsg('Product added! True Contribution Margin updated.');
        setTimeout(() => {
          setSuccessMsg('');
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recAmount || !recInvoiceRef) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/${businessId}/receivables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: recType,
          invoice_ref: recInvoiceRef,
          amount: Number(recAmount),
          counterparty: recCounterparty || 'Customer / Supplier',
          due_date: recDueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        }),
      });
      if (res.ok) {
        setSuccessMsg(`${recType === 'receivable' ? 'Receivable' : 'Payable'} logged! Cash flow updated.`);
        setTimeout(() => {
          setSuccessMsg('');
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" /> Manual Business Data Entry
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] sm:text-xs font-bold">
          <button
            onClick={() => setActiveTab('transaction')}
            className={`py-1.5 sm:py-2 rounded-lg transition-all ${activeTab === 'transaction' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Transaction
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`py-1.5 sm:py-2 rounded-lg transition-all ${activeTab === 'product' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Product / SKU
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`py-1.5 sm:py-2 rounded-lg transition-all ${activeTab === 'receivable' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Invoice / Due
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
          </div>
        )}

        {activeTab === 'transaction' && (
          <form onSubmit={handleSubmitTransaction} className="space-y-3 sm:space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Type</label>
                <select value={txnType} onChange={e => setTxnType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium">
                  <option value="income">Income (Sale / Collection)</option>
                  <option value="expense">Expense (Purchase / Opex)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                <input type="number" value={txnAmount} onChange={e => setTxnAmount(e.target.value)} placeholder="e.g. 15000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <input type="text" value={txnCategory} onChange={e => setTxnCategory(e.target.value)} placeholder="e.g. Sales, Rent, Stock" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select value={txnPaymentMethod} onChange={e => setTxnPaymentMethod(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium">
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Counterparty (Customer / Supplier)</label>
              <input type="text" value={txnCounterparty} onChange={e => setTxnCounterparty(e.target.value)} placeholder="e.g. Apex FMCG, Walk-in Customer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20">
              {loading ? 'Adding Transaction...' : 'Add Real Transaction Entry'}
            </button>
          </form>
        )}

        {activeTab === 'product' && (
          <form onSubmit={handleSubmitProduct} className="space-y-3 sm:space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Product Name</label>
              <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="e.g. Organic Almond Milk 1L" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">SKU Code</label>
                <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="e.g. MILK-1L-ORG" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <input type="text" value={prodCategory} onChange={e => setProdCategory(e.target.value)} placeholder="e.g. Dairy, Gourmet" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Price (₹)</label>
                <input type="number" value={prodCostPrice} onChange={e => setProdCostPrice(e.target.value)} placeholder="e.g. 180" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹)</label>
                <input type="number" value={prodSellingPrice} onChange={e => setProdSellingPrice(e.target.value)} placeholder="e.g. 240" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20">
              {loading ? 'Adding Product...' : 'Add Real Product Master Entry'}
            </button>
          </form>
        )}

        {activeTab === 'receivable' && (
          <form onSubmit={handleSubmitReceivable} className="space-y-3 sm:space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Type</label>
                <select value={recType} onChange={e => setRecType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium">
                  <option value="receivable">Receivable (Customer owes you)</option>
                  <option value="payable">Payable (You owe supplier)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Invoice Ref</label>
                <input type="text" value={recInvoiceRef} onChange={e => setRecInvoiceRef(e.target.value)} placeholder="e.g. INV-2026-104" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                <input type="number" value={recAmount} onChange={e => setRecAmount(e.target.value)} placeholder="e.g. 45000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" required />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Counterparty</label>
                <input type="text" value={recCounterparty} onChange={e => setRecCounterparty(e.target.value)} placeholder="e.g. Grand Palace Hotel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
              <input type="date" value={recDueDate} onChange={e => setRecDueDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20">
              {loading ? 'Logging Due Entry...' : 'Log Invoice Entry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

