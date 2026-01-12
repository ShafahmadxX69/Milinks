
import React, { useState, useRef } from 'react';
import { Search, AlertCircle, CheckCircle, Package, RefreshCw, Database, FileUp, Info } from 'lucide-react';
import { db } from '../services/db';
import { InvoiceCheckResult } from '../types';

const InvChecker: React.FC = () => {
  const [brand, setBrand] = useState('');
  const [invoice, setInvoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InvoiceCheckResult[] | null>(null);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = async () => {
    const trimmedBrand = brand.trim();
    const trimmedInvoice = invoice.trim();

    if (!trimmedBrand || !trimmedInvoice) {
      setError('Brand and Invoice number are required.');
      return;
    }
    
    setError('');
    setLoading(true);
    setData(null);

    try {
      const result = await db.checkInvoice(trimmedBrand, trimmedInvoice);
      setData(result);
      if (result.length === 0) {
        setError(`Invoice ${trimmedInvoice} not found for ${trimmedBrand} in the master sheet.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error: Unable to process logic request.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    const result = await db.importLogicSheet(file);
    setIsSyncing(false);
    
    if (result.success) {
      alert(result.message);
      setError('');
    } else {
      alert(result.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalQty = data ? data.reduce((acc, curr) => acc + curr.QTY, 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Database className="text-brand-600" size={32}/>
                Invoice Checker
            </h2>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Connected to Authority Logic Engine
            </p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
        >
          <FileUp size={16} className="group-hover:translate-y-[-1px] transition-transform" />
          {isSyncing ? 'Syncing...' : 'Sync Master Sheet (Backup)'}
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleManualSync} accept=".xlsx,.xls" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-6xl mx-auto overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Package size={200} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority Brand</label>
            <input 
              type="text" 
              className="w-full rounded-xl border-slate-200 border-2 p-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 font-bold uppercase"
              placeholder="e.g. AWAY"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Invoice</label>
            <input 
              type="text" 
              className="w-full rounded-xl border-slate-200 border-2 p-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 font-mono font-bold uppercase"
              placeholder="e.g. INV-9921"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleCheck}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {loading ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                <>
                   <Search size={24} className="group-hover:scale-110 transition-transform" /> 
                   <span className="tracking-tighter">EXECUTE FIFO LOGIC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-10 flex items-start gap-5 border-2 border-red-100 animate-shake">
            <AlertCircle size={28} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-black text-lg uppercase tracking-tighter">Logic Validation Error</p>
                <p className="text-sm font-medium mt-1 leading-relaxed opacity-80">{error}</p>
                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-red-100">
                    <p className="text-[10px] font-black uppercase text-red-400 tracking-wider mb-1">Recommendation</p>
                    <p className="text-xs">Ensure the Brand matches the name in Row 1 and the Invoice matches Row 5 of the 'IN' sheet.</p>
                </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50/30">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] bg-white border-b-2 border-slate-100">
              <tr>
                <th className="px-8 py-6">PO Reference</th>
                <th className="px-8 py-6">Type / Color</th>
                <th className="px-8 py-6 text-center">Size</th>
                <th className="px-8 py-6 text-right">Qty</th>
                <th className="px-8 py-6 text-center">Allocation</th>
                <th className="px-8 py-6 text-center">Export Info</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {data && data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={idx} className="bg-white hover:bg-brand-50/20 transition-colors group">
                    <td className="px-8 py-6 font-black text-slate-800 font-mono">{item.PO}</td>
                    <td className="px-8 py-6">
                        <div className="font-bold text-slate-700 uppercase leading-tight">{item.TYPE}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.COLOR}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600">{item.SIZE}</span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">{item.QTY}</td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        item.QTY_STATUS === 'READY' 
                            ? 'bg-green-500 text-white border-green-600' 
                            : 'bg-red-500 text-white border-red-600'
                      }`}>
                        {item.QTY_STATUS}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                         {item.INV_STATUS}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw size={40} className="animate-spin text-brand-500" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Consulting Authority Sheet...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-30">
                             <Package size={64} className="mb-4" />
                             <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Awaiting Brand & Invoice Input</p>
                        </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.length > 0 && (
            <div className="mt-10 flex flex-col md:flex-row items-center justify-between bg-brand-600 p-8 rounded-2xl text-white shadow-2xl shadow-brand-500/20 transform hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-xl">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{invoice}</h4>
                        <p className="text-[10px] text-brand-100 font-bold uppercase tracking-[0.3em] mt-2">Authority Confirmed Allocation</p>
                    </div>
                </div>
                <div className="text-right mt-6 md:mt-0">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cumulative Shipment Volume</p>
                    <div className="text-5xl font-black tabular-nums">{totalQty.toLocaleString()} <span className="text-sm opacity-50 ml-1">PCS</span></div>
                </div>
            </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-6 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-start gap-4">
          <Info className="text-slate-400 mt-1 flex-shrink-0" size={20} />
          <div className="text-xs text-slate-500 font-medium leading-relaxed">
              <span className="font-black text-slate-700 uppercase mr-1">Logic Notice:</span>
              This engine processes live stock data using a First-In-First-Out (FIFO) algorithm. Availability is calculated by deducting Rework Quantities (Col N) from Inventory In (Col J). The sort priority adheres strictly to Export Date then Column Position.
          </div>
      </div>
    </div>
  );
};

export default InvChecker;
