
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  RefreshCw, 
  Clock, 
  FileSpreadsheet, 
  Cloud,
  ChevronDown,
  Filter,
  FileText
} from 'lucide-react';
import { db, DriveFile, BRAND_FOLDERS, STUFFING_FOLDER } from '../services/db';

interface GeneratorProps {
  type: 'Packing' | 'Stuffing';
}

const Generator: React.FC<GeneratorProps> = ({ type }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>(Object.keys(BRAND_FOLDERS)[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine active folder ID based on selection
  const activeFolderId = type === 'Packing' 
    ? BRAND_FOLDERS[selectedBrand] 
    : STUFFING_FOLDER;

  const loadFiles = async () => {
    if (!activeFolderId) return;
    setLoading(true);
    setIsRefreshing(true);
    try {
      const driveFiles = await db.getDriveFiles(activeFolderId);
      setFiles(driveFiles);
    } catch (err) {
      console.error("Failed to load GDrive files:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [type, selectedBrand]);

  // Filter logic: match filename with search query
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="px-2 py-0.5 bg-brand-600 text-white text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
               <Cloud size={10} /> {type} Repository
             </div>
             <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Authority Cloud Connection</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
            {type} <span className="text-brand-600">Archive</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {type === 'Packing' 
              ? `Browsing ${selectedBrand} database. Every file follows the pattern: "${selectedBrand} [SO Number]".`
              : 'Search and download finalized shipping records by Invoice Name.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Database Sync</p>
              <p className="text-[10px] font-bold text-green-600 uppercase">Live Connection Active</p>
            </div>
            <button 
              onClick={loadFiles}
              disabled={isRefreshing}
              className="p-3 bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-100 transition-all border border-brand-100 shadow-sm"
            >
              <RefreshCw size={22} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {/* Brand & Search Selection Area */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        {type === 'Packing' && (
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">1. Select Brand Entity</label>
            <div className="relative">
              <select 
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSearchQuery(''); // Reset search when brand changes
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 outline-none appearance-none focus:border-brand-500 transition-all font-black text-slate-700 uppercase tracking-tight shadow-inner"
              >
                {Object.keys(BRAND_FOLDERS).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        )}
        <div className={type === 'Packing' ? "md:col-span-2" : "md:col-span-3"}>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            {type === 'Packing' ? `2. Search SO in ${selectedBrand} Database` : 'Search INV (Invoice Name)'}
          </label>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
              type="text" 
              placeholder={type === 'Packing' ? "Type SO Number (e.g. YOE-25110030)..." : "Type Invoice Number (e.g. INV-2024)..."}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-5 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col min-h-[550px]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
               <Filter size={18} />
             </div>
             <div>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Document Match Index</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Viewing all available .xlsx files</p>
             </div>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200">
             <span className="text-sm font-black text-brand-600">{filteredFiles.length}</span>
             <span className="text-[10px] font-black text-slate-400 uppercase">Documents</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-24">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting Google Drive Repository...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-40">
               <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                 <FileSpreadsheet size={48} className="text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">No Documents Match</h3>
               <p className="text-slate-400 text-sm mt-2 max-w-sm font-medium italic">
                 {searchQuery 
                   ? `We couldn't find any documents matching "${searchQuery}" in the ${type} database.` 
                   : "The repository appears to be empty or connection was interrupted."}
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-10">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="group bg-white border-2 border-slate-100 p-8 rounded-[2rem] hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-brand-50 text-brand-600 rounded-[1.2rem] group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                      <FileText size={28} />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Uploaded On</div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600">
                        <Clock size={14} className="text-brand-500" /> 
                        {new Date(file.updated).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase tracking-widest">Excel XLSX</span>
                       <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[9px] font-black rounded uppercase tracking-widest">{type} Log</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-xl leading-snug uppercase tracking-tighter line-clamp-2 min-h-[3.5rem] group-hover:text-brand-600 transition-colors">
                      {file.name.replace('.xlsx', '')}
                    </h4>
                  </div>

                  <a 
                    href={file.downloadUrl}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                  >
                    <Download size={18} /> Download Excel File
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Status Bar */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className={`h-2.5 w-2.5 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {loading ? 'Refreshing Cloud Stream...' : 'Authority Cloud Interface Secured'}
               </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
              <span>GDrive Partition: {activeFolderId.slice(-6)}</span>
              <span className="h-3 w-px bg-slate-200"></span>
              <span>v3.1.2 Production Build</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
