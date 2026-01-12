import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvChecker from './components/InvChecker';
import { SalesOrderTable, ExportListTable } from './components/MasterDataTables';
import Generator from './components/Generator';
import { Menu, Bell, User, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inv-checker':
        return <InvChecker />;
      case 'sales-order':
        return <SalesOrderTable />;
      case 'export-list':
        return <ExportListTable />;
      case 'packing-list':
        return <Generator type="Packing" />;
      case 'stuffing-list':
        return <Generator type="Stuffing" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={(view) => {
            setCurrentView(view);
            if (window.innerWidth < 1024) setSidebarOpen(false); // Close on mobile after click
        }}
        isOpen={sidebarOpen} 
      />

      {/* Main Layout */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-slate-600 focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-brand-900 hidden sm:block">Universal Luggage Indonesia</h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Language Selector */}
             <div className="hidden md:flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600 cursor-pointer">
                <Globe size={16} />
                <span>EN</span>
             </div>

             {/* Notifications */}
             <button className="p-2 relative rounded-full hover:bg-gray-100 text-slate-600">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>

             {/* Profile */}
             <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">Shafa Millah Ahmad</p>
                    <p className="text-xs text-slate-500">240501045</p>
                </div>
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200">
                    <User size={20} />
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Universal Luggage Indonesia. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;