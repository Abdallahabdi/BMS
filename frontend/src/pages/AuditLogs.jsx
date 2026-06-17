import React, { useState, useEffect } from 'react';
import { 
  History, DownloadCloud, FileDown, Database, 
  Clock, Activity, ChevronLeft, ChevronRight, Menu, Zap, Fingerprint, ShieldAlert, Cpu
} from 'lucide-react';
import API from '../api/api';
import { toast } from 'react-toastify';

const AuditLogs = ({ toggleSidebar }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/audit-logs');
      const data = res.data;
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      toast.error("Rukhsad uma haysatid inaad aragto diiwaanka.");
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <Zap size={12} className="mr-1 inline" />;
      case 'UPDATE': return <Activity size={12} className="mr-1 inline" />;
      case 'DELETE': return <ShieldAlert size={12} className="mr-1 inline" />;
      default: return <Cpu size={12} className="mr-1 inline" />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans p-4 lg:p-10 relative overflow-hidden pb-20">
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <button onClick={toggleSidebar} className="lg:hidden p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm">
                  <Menu size={20}/>
               </button>
               <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                 <span className="relative flex h-2 w-2 mr-1">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 Live System Forensics
               </div>
            </div>
            <p className="text-emerald-600 uppercase tracking-[0.25em] text-xs font-black">
              Admin Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mt-2">Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Logs.</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Monitor, Track, and Audit all platform operations</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition shadow-sm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><FileDown size={16}/> Export CSV</button>
            <button className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition shadow-sm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Database size={16}/> Backup</button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-transparent"></div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-32 text-center flex flex-col items-center">
                 <div className="animate-spin w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full mb-6"></div>
                 <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Decrypting Logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-32 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6 border border-slate-200"><History size={48} strokeWidth={1.5}/></div>
                <h3 className="font-black text-slate-500 uppercase text-xs tracking-[0.2em]">No activity recorded yet</h3>
              </div>
            ) : (
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/80 text-[9px] font-black tracking-widest text-slate-500 uppercase border-b border-slate-200">
                    <th className="px-8 py-6">Operation / Type</th>
                    <th className="px-8 py-6">Operator / Identity</th>
                    <th className="px-8 py-6">Target Module</th>
                    <th className="px-8 py-6">Timestamp / Zone</th>
                    <th className="px-8 py-6">Decrypted Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-default">
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionStyle(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors shadow-inner">
                               <Fingerprint size={16} />
                            </div>
                            <div>
                               <span className="text-sm font-bold text-slate-900 block">{log.user?.name || 'SYSTEM_ADMIN'}</span>
                               <span className="text-[10px] font-mono text-slate-500 uppercase">{log.user?._id?.slice(-8) || '0x0000'}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">{log.itemType}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                           <span className="text-slate-600 font-mono text-xs font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                           <span className="text-emerald-600 font-mono text-[10px] mt-1 flex items-center gap-1 font-medium"><Clock size={10}/> {new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-md">{log.description}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Database size={14} className="text-slate-400" /> Server Connection: Stable | Page {currentPage} of {Math.ceil(logs.length / itemsPerPage) || 1}
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(logs.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(logs.length / itemsPerPage)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                >
                  <ChevronRight size={16}/>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
