import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, MapPin, Calendar, X, ArrowLeft, ArrowRight, Info, Menu, Smartphone, Shirt, FileText, Key, Wallet, Box } from 'lucide-react';
import API, { API_URL, getImageUrl } from '../api/api';
import { toast } from 'react-toastify';

export default function MatchDetails({ toggleSidebar }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const res = await API.get(`/matches/${id}`); setMatch(res.data); } catch(e){ toast.error("Error loading match!"); } finally { setLoading(false); }
  })() }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div></div>;
  if (!match) return <div className="min-h-screen flex flex-col items-center justify-center p-6"><h2 className="text-2xl font-black mb-4">Case Not Found</h2><button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold">Back home</button></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans selection:bg-emerald-100">
      <div className="max-w-6xl mx-auto">
        
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center mb-8">
          <button 
            onClick={toggleSidebar}
            className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600"
          >
            <Menu size={20} />
          </button>
          <div className="font-black text-xl tracking-tighter text-slate-900 px-4">
            BAAFIN<span className="text-emerald-600">.</span>
          </div>
        </div>

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-10 hover:text-emerald-600 transition"><ArrowLeft size={16}/> Back</button>

        <div className="flex justify-between items-center mb-16 relative py-4 max-w-2xl mx-auto">
           {[ {l:'Reported', c:'text-green-500'}, {l:'Matched', c:'text-emerald-600'}, {l:'Verified', c:'text-slate-200'} ].map((s,i) => (
             <div key={i} className="flex flex-col items-center gap-3 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${i < 2 ? "bg-emerald-600 text-white" : "bg-white text-slate-200 border"}`}><CheckCircle size={18}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.l}</span>
             </div>
           ))}
           <div className="absolute top-9 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-emerald-100 mb-6 shadow-sm"><Info size={14}/> Match Confidence {match.score}%</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Ownership <span className="text-emerald-600">Verification</span></h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {[{t:'Your Entry', d:match.lost, s:'bg-slate-100'}, {t:'Park Discovery', d:match.found, s:'bg-emerald-600 border-4 border-emerald-600'}].map((x,i) => (
            <div key={i} className={`bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col relative overflow-hidden group`}>
              <div className="flex justify-between mb-8">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{x.t}</span>
                 <span className="text-[10px] font-bold text-slate-300">#{x.d._id?.slice(-4)}</span>
              </div>
              <div className="h-64 rounded-[2rem] overflow-hidden mb-8 bg-slate-100 border border-slate-50 shadow-inner">
                 {x.d.image ? (
                   <img src={getImageUrl(x.d.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:scale-105 transition-transform duration-700">
                     {x.d.category === 'Electronics' ? <Smartphone size={80} strokeWidth={1} /> :
                      x.d.category === 'Clothing' ? <Shirt size={80} strokeWidth={1} /> :
                      x.d.category === 'Documents' ? <FileText size={80} strokeWidth={1} /> :
                      x.d.category === 'Keys' ? <Key size={80} strokeWidth={1} /> :
                      x.d.category === 'Wallets' ? <Wallet size={80} strokeWidth={1} /> :
                      <Box size={80} strokeWidth={1} />}
                   </div>
                 )}
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-4">{x.d.itemName}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 flex-1">{x.d.description}</p>
              <div className="grid grid-cols-2 pt-8 border-t border-slate-50 gap-4">
                 <div><p className="text-[10px] text-slate-300 uppercase font-black mb-1">Zone</p><p className="text-xs font-black text-slate-800 flex items-center gap-1"><MapPin size={12}/> {x.d.parkZone}</p></div>
                 <div><p className="text-[10px] text-slate-300 uppercase font-black mb-1">Date</p><p className="text-xs font-black text-slate-800 flex items-center gap-1"><Calendar size={12}/> {new Date(x.d.dateTime).toLocaleDateString()}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-[3rem] shadow-xl border border-slate-50 max-w-2xl mx-auto">
           <button onClick={() => navigate('/')} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition flex items-center justify-center gap-3"><CheckCircle size={18}/> This is Correct</button>
           <button onClick={() => navigate(-1)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition flex items-center justify-center gap-2"><X size={18}/> Discard Match</button>
        </div>
      </div>
    </div>
  );
}