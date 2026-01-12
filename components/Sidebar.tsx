
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Truck, 
  PackageCheck, 
  ChevronDown, 
  ChevronRight,
  ClipboardList,
  Container,
  History,
  Activity,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen }) => {
  const [masterDataOpen, setMasterDataOpen] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(true);

  const menuItemClass = (view: string) => `
    flex items-center w-full p-3 my-1 rounded-lg transition-all duration-200 cursor-pointer group
    ${currentView === view 
      ? 'bg-brand-600 text-white shadow-lg scale-[1.02]' 
      : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'}
  `;

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto fixed left-0 top-0 z-20 flex flex-col shadow-xl">
      <div className="p-6 flex items-center justify-center border-b border-gray-100 bg-slate-50/50">
        <div className="flex flex-col items-center">
            <div className="h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mb-2 shadow-lg shadow-brand-600/20 transform rotate-3">UL</div>
            <h1 className="font-black text-lg text-slate-800 tracking-tighter uppercase">Universal Luggage</h1>
            <span className="text-[9px] text-brand-600 font-black uppercase tracking-[0.2em] -mt-1">Manufacturing System</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        {/* Main Production Dashboard */}
        <div 
          onClick={() => setView('dashboard')}
          className={menuItemClass('dashboard')}
        >
          <div className={`p-1.5 rounded-md mr-3 ${currentView === 'dashboard' ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>
            <Activity size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">Dashboard</span>
            <span className={`text-[10px] ${currentView === 'dashboard' ? 'text-brand-100' : 'text-slate-400'} font-black uppercase tracking-tighter`}>Produced + Remaining</span>
          </div>
        </div>

        {/* Internal Modules Section */}
        <div className="mt-8">
          <div 
            onClick={() => setMasterDataOpen(!masterDataOpen)}
            className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-brand-600 transition-colors"
          >
            <span>Operations Center</span>
            {masterDataOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          </div>
          
          {masterDataOpen && (
            <div className="mt-1 space-y-1">
              <div 
                onClick={() => setView('sales-order')}
                className={menuItemClass('sales-order')}
              >
                <ClipboardList size={18} className="mr-3" />
                <span className="text-sm font-semibold">SO Index</span>
              </div>
              
              <div 
                onClick={() => setView('export-list')}
                className={menuItemClass('export-list')}
              >
                <Truck size={18} className="mr-3" />
                <span className="text-sm font-semibold">Export Log</span>
              </div>

              <div 
                onClick={() => setView('inv-checker')}
                className={menuItemClass('inv-checker')}
              >
                <PackageCheck size={18} className="mr-3 text-brand-500" />
                <span className="text-sm font-bold">INV Checker</span>
              </div>
            </div>
          )}
        </div>

        {/* Generation Section */}
        <div className="mt-8">
          <div 
            onClick={() => setGenerateOpen(!generateOpen)}
            className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-brand-600 transition-colors"
          >
            <span>Documents Generator</span>
            {generateOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          </div>
          
          {generateOpen && (
            <div className="mt-1 space-y-1">
              <div 
                onClick={() => setView('packing-list')}
                className={menuItemClass('packing-list')}
              >
                <FileText size={18} className="mr-3" />
                <span className="text-sm font-semibold">Packing List</span>
              </div>
              
              <div 
                onClick={() => setView('stuffing-list')}
                className={menuItemClass('stuffing-list')}
              >
                <Container size={18} className="mr-3" />
                <span className="text-sm font-semibold">Stuffing List</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Backend Health Status */}
      <div className="p-4 border-t border-gray-100 bg-slate-50/50">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
             <BarChart3 size={14} className="text-brand-500" />
             <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Logic Authority</p>
           </div>
           <div className="flex items-center">
             <div className="h-2 w-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
             <span className="text-[11px] text-slate-700 font-bold italic tracking-tight underline decoration-brand-200 decoration-2">Spreadsheet Live</span>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
