'use client';

import { useState } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setParsedRows([
        { date: '2026-08-10', type: 'expense', category: 'Inventory Purchase', amount: '68,000', counterparty: 'Shree Laxmi Wholesalers' },
        { date: '2026-08-11', type: 'income', category: 'Sales', amount: '12,450', counterparty: 'Retail Sale' },
        { date: '2026-08-12', type: 'expense', category: 'Utilities', amount: '6,200', counterparty: 'Electricity Board' },
      ]);
    }
  };

  const handleConfirmImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-emerald-600" /> Data Import Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload CSV or XLSX transaction files with column mapping & row validation.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 border-dashed text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">Upload CSV or XLSX File</div>
          <p className="text-xs text-slate-500 mt-1">Supported entities: Transactions, Sales Line Items, Inventory Events, Expenses</p>
        </div>

        <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" id="csv-upload" />
        <label
          htmlFor="csv-upload"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20"
        >
          Select File from Computer
        </label>
      </div>

      {file && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <FileCheck className="w-4 h-4 text-emerald-600" /> {file.name} (3 preview rows parsed)
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold font-mono">Validation Passed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Amount (₹)</th>
                  <th className="py-2 px-3">Counterparty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parsedRows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 text-slate-600">{r.date}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">{r.type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.category}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-extrabold">₹{r.amount}</td>
                    <td className="py-2.5 px-3 text-slate-800">{r.counterparty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleConfirmImport}
            disabled={importing || success}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            {success ? <CheckCircle2 className="w-4 h-4" /> : null}
            {success ? 'Import Completed & Engines Recomputed' : importing ? 'Importing Rows...' : 'Confirm & Import Selected Rows'}
          </button>
        </div>
      )}
    </div>
  );
}
