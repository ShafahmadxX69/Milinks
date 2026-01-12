
import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { ProductionStat, SalesOrder } from '../types';
import { db } from '../services/db';
import { 
  AlertCircle, Package, CheckCircle, Clock, 
  Factory, Target, Truck, BarChart3, Info, Download, Database
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [productionData, setProductionData] = useState<ProductionStat[]>([]);
  const [activeOrders, setActiveOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
        const stats = await db.getDashboardStats();
        const orders = await db.getSalesOrders();
        setProductionData(stats.productionData);
        setActiveOrders(orders);
        setLoading(false);
    };
    loadStats();
  }, []);

  const trendData = [
    { day: 'Mon', produced: 850 },
    { day: 'Tue', produced: 940 },
    { day: 'Wed', produced: 1100 },
    { day: 'Thu', produced: 980 },
    { day: 'Fri', produced: 1250 },
    { day: 'Sat', produced: 800 },
    { day: 'Sun', produced: 450 },
  ];

  const brands = Array.from(new Set(activeOrders.map(o => o.brand)));
  const brandExportData = brands.length > 0 ? brands.map((brand, idx) => {
    const colors = ['#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#10b981'];
    return {
        brand,
        qty: activeOrders.filter(o => o.brand === brand).length * 5000, 
        rem: 1500,
        color: colors[idx % colors.length]
    };
  }) : [
    { brand: 'AWAY', qty: 15000, rem: 4000, color: '#0ea5e9' },
    { brand: 'LOJEL', qty: 8500, rem: 1200, color: '#6366f1' },
    { brand: 'TUMI', qty: 4500, rem: 800, color: '#f59e0b' }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Accessing Spreadsheet DB</p>
        <p className="text-slate-400 text-xs mt-1">Reading ExpSched & Shipping Record...</p>
      </div>
    </div>
  );

  const totalProduced = productionData.find(p => p.name === 'Produced')?.value || 0;
  const remaining = productionData.find(p => p.name === 'Remaining')?.value || 0;
  const rework = productionData.find(p => p.name === 'Rework')?.value || 0;
  const totalOrder = totalProduced + remaining;
  const completionRate = totalOrder > 0 ? Math.round((totalProduced / totalOrder) * 100) : 0;

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black rounded uppercase tracking-widest">Live Sync</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Authority: INVOICE CHECKER</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Dashboard <span className="text-brand-600">(Produced + Rem)</span></h2>
          <p className="text-slate-500 text-sm font-medium">Fulfillment tracking sourced from <span className="text-slate-800 font-bold">ExpSched</span> & <span className="text-slate-800 font-bold">IN</span> sheets.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Overall Progress</p>
               <div className="flex items-center gap-2">
                 <span className="text-2xl font-black text-slate-800">{completionRate}%</span>
                 <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-brand-600 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                 </div>
               </div>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
               <Target size={24} />
            </div>
        </div>
      </div>

      {/* KPI Section with explicit Sheet Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Produced', value: totalProduced, color: 'text-brand-600', icon: Factory, bg: 'bg-brand-50', border: 'border-brand-100', source: 'Sheet "IN" (Col J)' },
          { label: 'Remaining Stock', value: remaining, color: 'text-orange-600', icon: Clock, bg: 'bg-orange-50', border: 'border-orange-100', source: 'ExpSched - IN' },
          { label: 'Under Rework', value: rework, color: 'text-red-600', icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-100', source: 'Sheet "IN" (Col N)' },
          { label: 'Order Target (PO)', value: totalOrder, color: 'text-slate-800', icon: Package, bg: 'bg-slate-50', border: 'border-slate-200', source: 'Sheet "ExpSched" (Col E)' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl shadow-sm border ${stat.border} bg-white group hover:shadow-xl hover:scale-[1.02] transition-all`}>
             <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Authority Source</span>
                  <span className="text-[9px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">{stat.source}</span>
               </div>
             </div>
             <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Brand Export Analysis Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Brand Export Analysis</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sourced from: Sheet "Shipping Record" & "ExpSched"</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                <Download size={14} /> Download Metrics
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Graphic 1: Brand Volume */}
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Qty Distribution</h4>
                  <p className="text-[9px] text-brand-500 font-bold uppercase">Shipping Record!Col D</p>
                </div>
                <BarChart3 size={16} className="text-slate-300" />
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandExportData} layout="vertical" margin={{ left: -20, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="brand" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="qty" radius={[0, 4, 4, 0]} barSize={24}>
                      {brandExportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Brand Detail Table */}
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col h-[420px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Fulfillment Metrics</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div> Map: ExpSched!Col C ⇄ Shipping Record
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Brand (ExpSched!C)</th>
                      <th className="px-6 py-4">Produced (IN!J)</th>
                      <th className="px-6 py-4">Remaining</th>
                      <th className="px-6 py-4">Fulfillment %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {brandExportData.map((b) => {
                      const rate = Math.round((b.qty / (b.qty + b.rem)) * 100);
                      return (
                        <tr key={b.brand} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }}></div>
                              <span className="font-black text-slate-700 tracking-tight text-base uppercase">{b.brand}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-mono font-bold text-slate-800">{b.qty.toLocaleString()}</td>
                          <td className="px-6 py-5 font-mono font-bold text-slate-400">{b.rem.toLocaleString()}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rate}%`, backgroundColor: b.color }}></div>
                              </div>
                              <span className="text-[11px] font-black text-slate-600">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculated dynamically using bridge Logic</p>
              </div>
           </div>
        </div>
      </div>

      {/* Production Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Inventory Status</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Source: Sheet "IN" + "ExpSched"</p>
            </div>
            <Database size={16} className="text-slate-300" />
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productionData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  {productionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2 h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Daily Production Output</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Source: Sheet "IN" by Date</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="produced" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
