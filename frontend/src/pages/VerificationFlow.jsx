import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Info, AlertCircle, Loader2, ArrowLeft, Menu, Fingerprint, ScanEye, Search, Zap, PackageCheck, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import API, { API_URL, getImageUrl } from '../api/api';
import { toast } from 'react-toastify';

const VerificationFlow = ({ toggleSidebar }) => {
  const { id } = useParams(); // claimId
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checks, setChecks] = useState([false, false, false, false, false]);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/claims/${id}`);
      setClaim(res.data);
    } catch (error) {
      console.error("Error fetching claim:", error);
      toast.error("Failed to load claim details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await API.patch(`/claims/${id}/status`, { status });
      toast.success(`Claim has been ${status === 'approved' ? 'approved' : 'rejected'}!`);
      navigate('/admin');
    } catch (error) {
       toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCheck = (index) => {
    const newChecks = [...checks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <ScanEye className="animate-pulse text-emerald-500 mb-6" size={64} />
      <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs animate-bounce">Accessing Protocol...</p>
    </div>
  );

  if (!claim) return (
     <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-white text-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Claim Not Found</h2>
        <button onClick={() => navigate('/admin')} className="bg-slate-800 px-6 py-2 rounded-xl border border-slate-700">Back to Portal</button>
     </div>
  );

  const { item = {}, claimer = {} } = claim;
  const allChecked = checks.every(c => c === true);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-300 font-sans p-4 lg:p-8 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-slate-800/80 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={toggleSidebar} className="lg:hidden p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition">
                <Menu size={20}/>
              </button>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs font-black uppercase tracking-widest">
                <ArrowLeft size={14}/> Back
              </button>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Secure Line</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tighter">
              Identity Verification.
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">Protocol ID: {claim._id}</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl w-full md:w-auto text-left md:text-right backdrop-blur-md">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center md:justify-end gap-2">
               <Fingerprint size={12} className="text-emerald-500" /> Target Subject
            </p>
            <p className="text-2xl font-black text-white tracking-tight">{claimer?.name}</p>
            <p className="text-xs font-bold text-emerald-400 mt-1">{claimer?.email}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* USER CLAIM CONTEXT */}
          <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -mt-10 -mr-10 transition-colors group-hover:bg-emerald-500/20"></div>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <ScanEye size={20} />
               </div>
               <h3 className="text-white font-black tracking-tight text-lg">Visual Evidence</h3>
            </div>
            
            <div className="aspect-square bg-slate-950 rounded-3xl mb-8 border border-slate-800 overflow-hidden flex items-center justify-center relative group-hover:border-slate-700 transition-colors shadow-inner">
               {item?.image ? (
                 <>
                   <img src={getImageUrl(item?.image)} className="w-full h-full object-cover opacity-80" alt="item proof" />
                   {/* Khadka dhuuqista (Scanning effect) oo loo beddelay Tailwind CSS */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 shadow-[0_0_15px_#34d399] opacity-50 [animation:scan_3s_linear_infinite]"></div>
                 </>
               ) : (
                 <div className="flex flex-col items-center opacity-30">
                    <AlertCircle size={48} className="mb-2" />
                    <span className="text-[10px] uppercase tracking-widest font-black">No Imagery</span>
                 </div>
               )}
            </div>
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative">
               <div className="absolute -top-3 left-4 bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Subject Statement</div>
               <p className="text-sm font-medium text-slate-300 leading-relaxed italic mt-2">
                 {claim.messages?.[0]?.text || "No initial statement recorded."}
               </p>
            </div>
          </div>

          {/* REGISTRY ITEM DETAILS */}
          <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Search size={20} />
               </div>
               <h3 className="text-white font-black tracking-tight text-lg">Registry Match</h3>
            </div>
            
            <div className="space-y-4">
               <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><PackageCheck size={12}/> Item Designation</p>
                  <p className="text-xl font-black text-white">{item?.itemName}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Class</p>
                     <p className="text-sm font-bold text-slate-200">{item?.category}</p>
                  </div>
                  <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Type</p>
                     <p className="text-sm font-bold text-slate-200 capitalize">{item?.itemType}</p>
                  </div>
               </div>

               <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={12}/> Recovery Vector</p>
                  <p className="text-sm font-bold text-emerald-400">{item?.parkZone}</p>
               </div>

               <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">System Profile</p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">{item?.description}</p>
               </div>
            </div>
          </div>

          {/* SECURITY CHECKLIST & ACTIONS */}
          <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                     <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-white font-black tracking-tight text-lg">Security Clearance</h3>
               </div>
               
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Mandatory Checklist</p>
               
               <div className="space-y-4">
                 {['Visual Identification Match', 'Unique Identifiers Verified', 'Contents Cross-Checked', 'Claimant ID Validity', 'Location Logic Validated'].map((check, i) => (
                   <div 
                     key={i} 
                     onClick={() => toggleCheck(i)}
                     className={`flex gap-4 items-center p-4 rounded-2xl border transition-all cursor-pointer ${checks[i] ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}
                   >
                     <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${checks[i] ? 'bg-emerald-500 text-white' : 'border-2 border-slate-600 text-transparent'}`}>
                        <CheckCircle2 size={16} strokeWidth={3} />
                     </div>
                     <p className={`text-xs font-black uppercase tracking-wider transition ${checks[i] ? 'text-emerald-400' : 'text-slate-400'}`}>{check}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="mt-8">
               <div className="p-5 bg-blue-900/20 border border-blue-500/20 rounded-2xl mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Zap size={64} />
                  </div>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed relative z-10">
                    <span className="text-white">Authorization Note:</span> Full clearance approves the claim and releases the item to the claimant.
                  </p>
               </div>
               
               {/* Halkan waa qaybtii badamada (Action Buttons) oo dhammaystiran */}
               {claim.status === 'pending' ? (
                 <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => handleStatusUpdate('approved')}
                     disabled={actionLoading || !allChecked}
                     className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                   >
                     {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18} className="group-hover:scale-125 transition-transform" />} 
                     {allChecked ? 'Authorize Release' : 'Complete Checks First'}
                   </button>
                   <button 
                     onClick={() => handleStatusUpdate('rejected')}
                     disabled={actionLoading}
                     className="w-full bg-slate-950 hover:bg-red-950/30 text-red-500 border border-slate-800 hover:border-red-900/50 font-black text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                   >
                     {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <XCircle size={18} />} Reject Protocol
                   </button>
                 </div>
               ) : (
                 <div className="p-6 text-center border border-slate-800 rounded-2xl bg-slate-900/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Claim Status</p>
                    <p className={`text-xl font-black mt-2 capitalize ${claim.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>{claim.status}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationFlow;