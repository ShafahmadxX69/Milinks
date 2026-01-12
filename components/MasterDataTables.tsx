
import React, { useEffect, useState, useRef } from 'react';
import { SalesOrder, StuffingList, SalesOrderItem } from '../types';
import { db } from '../services/db';
import { 
  Download, Plus, Filter, FileSpreadsheet, Upload, 
  FileUp, Layers, Edit2, Trash2, Eye, X, 
  Package, Box, Clipboard, ChevronRight
} from 'lucide-react';

export const SalesOrderTable: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await db.getSalesOrders();
    setOrders(data);
    setLoading(false);
  };

  const openDetails = (so: SalesOrder) => {
    setSelectedSO(so);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sales Order Index</h2>
           <p className="text-slate-500 text-sm mt-1">Sourced live from <span className="text-slate-800 font-bold underline decoration-brand-200 decoration-2">SALES_ORDER_INDEX</span>.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm font-bold text-sm">
                <Filter size={18} /> Filter
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">SO Number</th>
                <th className="px-6 py-4">Customer POs</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Authority Index...</p>
                    </div>
                </td></tr>
              ) : orders.map((so) => (
                <tr key={so.id} className="bg-white hover:bg-brand-50/30 transition-colors cursor-pointer group" onClick={() => openDetails(so)}>
                  <td className="px-6 py-5 font-black text-slate-800 uppercase tracking-tight">{so.brand}</td>
                  <td className="px-6 py-5 font-mono text-brand-600 font-bold">{so.soNumber}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {so.customerPos.map(po => (
                        <span key={po} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black border border-slate-200 uppercase">{po}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border
                      ${so.status === 'Finished Produced' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-brand-50 text-brand-700 border-brand-100'}`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Eye size={18} /></button>
                        <ChevronRight size={18} className="text-slate-300 ml-1" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED SO MODAL WINDOW */}
      {isModalOpen && selectedSO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-600/20"><Clipboard size={28} /></div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedSO.soNumber}</h3>
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-[10px] font-black rounded-lg uppercase border border-brand-100">{selectedSO.brand}</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Detailed specifications and item breakdown</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200/50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Lifecycle</p>
                  <p className="font-black text-slate-800 text-lg uppercase tracking-tighter">{selectedSO.status}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authority Import</p>
                  <p className="font-black text-slate-800 text-lg">{new Date(selectedSO.importedAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linked POs</p>
                  <p className="font-black text-slate-800 text-lg">{selectedSO.customerPos.join(', ')}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Package size={20} className="text-brand-600" /> Item Index</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Material No</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Color</th>
                        <th className="px-6 py-4 text-center">Pcs/Ctn</th>
                        <th className="px-6 py-4 text-center">Ctns</th>
                        <th className="px-6 py-4 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSO.sheets.flatMap(s => s.items).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.materialNo}</td>
                          <td className="px-6 py-4 text-slate-600 font-semibold">{item.nameSpec}</td>
                          <td className="px-6 py-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.color}</span></td>
                          <td className="px-6 py-4 text-center font-bold text-slate-700">{item.pcsPerCtn}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-700">{item.totalCtns}</td>
                          <td className="px-6 py-4 text-right font-black text-brand-600 text-lg">{item.totalQty.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/30 gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all">Close</button>
              <button className="px-6 py-3 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"><Download size={16} /> Export Spec</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ExportListTable: React.FC = () => {
    const [exports, setExports] = useState<StuffingList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      db.getStuffingLists().then(data => { setExports(data); setLoading(false); });
    }, []);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Export Log</h2>
             <p className="text-slate-500 text-sm mt-1">Live tracking from <span className="text-slate-800 font-bold underline decoration-brand-200">EXPORT_LOG</span>.</p>
          </div>
        </div>
  
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Container No</th>
                  <th className="px-6 py-4">Seal No</th>
                  <th className="px-6 py-4">Export Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading Log...</td></tr>
                ) : exports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic font-medium">No export records found.</td></tr>
                ) : exports.map((ex) => (
                  <tr key={ex.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-black text-slate-800 font-mono tracking-tighter">{ex.invoiceNo}</td>
                    <td className="px-6 py-5 font-mono text-xs text-brand-600 font-bold">{ex.containerNo}</td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">{ex.sealNo || '—'}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{ex.exportDate || 'TBA'}</td>
                    <td className="px-6 py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border
                        ${ex.isFinalized ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {ex.isFinalized ? 'Shipped' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};
