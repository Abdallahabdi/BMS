import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Search, Menu, PackageCheck } from 'lucide-react';
import API, { API_URL, getImageUrl } from '../api/api';
import { toast } from 'react-toastify';

const ReturnedItems = ({ toggleSidebar }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturnedItems();
  }, []);

  const fetchReturnedItems = async () => {
    try {
      setLoading(true);
      const res = await API.get('/items?limit=1000&status=returned');
      if (res.data && Array.isArray(res.data.items)) {
        setItems(res.data.items);
      }
    } catch (error) {
      console.error("Error fetching returned items:", error);
      toast.error("Soo shubista sheekooyinka guusha ayaa fashilantay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans selection:bg-emerald-100 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 lg:mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-black text-3xl tracking-tighter text-slate-900 flex items-center gap-3">
              Success Stories<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Items successfully returned to owners</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
           <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.length === 0 ? (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <PackageCheck size={64} className="text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Returned Items Yet</h3>
                <p className="text-slate-400 max-w-sm">When items are successfully claimed and returned, they will appear here as a success story.</p>
             </div>
          ) : (
             items.map(item => (
                <div key={item._id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col">
                   <div className="absolute top-4 right-4 z-10 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={12} /> Returned
                   </div>
                   
                   <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-xs">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                         <p className="text-white font-black text-lg truncate drop-shadow-md">{item.itemName}</p>
                         <p className="text-emerald-300 text-xs font-bold truncate drop-shadow-md">{item.category}</p>
                      </div>
                   </div>

                   <div className="p-6 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                         {item.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                           <ShieldCheck size={14} />
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Reported By</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{item.reportedBy?.name || "Good Samaritan"}</p>
                         </div>
                      </div>
                   </div>
                </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReturnedItems;
