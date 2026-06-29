import React, { useState, useEffect } from "react";
import API from '../api/api';
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus, X, Zap, Box, MapPin, Clock, Menu,
  Tag, Palette, AlignLeft, Info, Camera,
  Flower2, Gamepad2, Car, Utensils, DoorOpen, MoonStar, ArrowRight, Loader2
} from 'lucide-react';

export default function ReportItem({ user, toggleSidebar }) {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("lost");
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    description: "",
    parkZone: "",
    dateTime: ""
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.warn("Fadlan marka hore soo gal (Please log in first).");
      navigate("/login");
    }
    // Load zones from API
    API.get('/parkzones')
      .then(res => setZones(res.data || []))
      .catch(() => {
        // Fallback to default zones if API fails
        setZones([
          { name: "Beerta Ubaxa", icon: "Flower2" },
          { name: "Goobta Ciyaarta", icon: "Gamepad2" },
          { name: "Baabuur Dhigashada", icon: "Car" },
          { name: "Maqaayadda Cuntada", icon: "Utensils" },
          { name: "Albaabka Weyn", icon: "DoorOpen" },
          { name: "Masaajidka", icon: "MoonStar" },
          { name: "Others", icon: "MapPin" }
        ]);
      })
      .finally(() => setZonesLoading(false));
  }, [user, navigate]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.category || !formData.parkZone || !formData.dateTime) {
      return toast.error("Fadlan buuxi dhammaan xogta muhiimka ah.");
    }
    if (!image && reportType === "found") {
      return toast.warn("Fadlan soo geli sawirka alaabta aad heshay.");
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      data.append("itemType", reportType);
      if (image) data.append("image", image);

      await API.post('/items', data);
      toast.success("Xogtaada si guul leh ayaa loo diray!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cillad ayaa dhacday.");
    } finally {
      setLoading(false);
    }
  };

  const cats = ["Electronics", "Clothing", "Documents", "Keys", "Bugs", "Other"];


  return (
    <div className="min-h-screen bg-[#f5f8f6] font-sans selection:bg-[#0df246] selection:text-[#102214] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 relative z-10">

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center mb-8 bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white/40 shadow-sm">
          <button onClick={toggleSidebar} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 hover:bg-emerald-50 transition-colors">
            <Menu size={20} />
          </button>
          <div className="font-black text-2xl tracking-tighter text-[#102214] pr-2">
            BAAFIN<span className="text-emerald-500">.</span>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-500/20 text-emerald-700 mb-3 hover:bg-emerald-100 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Daarusalaam Park</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#102214] tracking-tight">Report <span className="text-emerald-600">Item</span></h1>
          </div>
          <Link to="/" className="w-14 h-14 bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-500/10 transition-all transform hover:rotate-90 duration-300">
            <X size={24} />
          </Link>
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden animate-in fade-in zoom-in-95 duration-700">

          {/* TYPE TOGGLE */}
          <div className="p-3 bg-white/50 border-b border-white/60 flex gap-3 backdrop-blur-md">
            {['lost', 'found'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setReportType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all duration-300 ${reportType === t
                    ? t === 'lost'
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 transform scale-[1.02]"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transform scale-[1.02]"
                    : "bg-white/60 text-slate-400 hover:bg-white border border-white hover:text-slate-600 hover:shadow-sm"
                  }`}
              >
                {t === 'lost' ? <Zap size={18} className={reportType === t ? "animate-pulse" : ""} /> : <Plus size={18} className={reportType === t ? "animate-pulse" : ""} />}
                I {t} something
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

              {/* LEFT COLUMN: CORE INFO */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className={`p-2 rounded-xl text-white shadow-md ${reportType === 'lost' ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                    <Box size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-black text-[#102214] tracking-tight">Item Details</h3>
                </div>

                <div className="space-y-6">
                  {/* Item Name */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      <Tag size={12} /> Item Name
                    </label>
                    <input
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder="e.g. iPhone 13 Pro"
                      className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium shadow-sm hover:border-emerald-500/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        <Box size={12} /> Category
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 appearance-none shadow-sm hover:border-emerald-500/30 cursor-pointer"
                        >
                          <option value="" disabled>Select Category</option>
                          {cats.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        <Palette size={12} /> Item Color
                      </label>
                      <input
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g. Space Gray"
                        className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium shadow-sm hover:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      <AlignLeft size={12} /> Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Any unique serial numbers, marks, or specific details..."
                      className="w-full p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 h-36 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium resize-none shadow-sm hover:border-emerald-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LOCATION & MEDIA */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-black text-[#102214] tracking-tight">Location & Time</h3>
                </div>

                <div className="space-y-8">
                  {/* Location Zones */}
                  <div className="group">
                    <label className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      <span className="flex items-center gap-2"><MapPin size={12} /> Zone Selection (Location)</span>
                      <span className="text-emerald-500 normal-case tracking-normal font-bold flex items-center gap-1"><Info size={12} /> Required</span>
                    </label>
                    <div className="relative">
                      <select
                        name="parkZone"
                        value={formData.parkZone}
                        onChange={handleChange}
                        disabled={zonesLoading}
                        className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 appearance-none shadow-sm hover:border-emerald-500/30 cursor-pointer disabled:opacity-60"
                      >
                        <option value="" disabled>
                          {zonesLoading ? 'Goobaha waa la raraa...' : 'Select Location / Zone'}
                        </option>
                        {zones.map((z) => (
                          <option key={z._id || z.name} value={z.name}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                        {zonesLoading
                          ? <Loader2 size={16} className="animate-spin" />
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Date Time */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      <Clock size={12} /> Date & Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        name="dateTime"
                        value={formData.dateTime}
                        onChange={handleChange}
                        className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none focus:border-emerald-500/30 transition-all duration-300 font-bold text-slate-700 shadow-sm hover:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      <Camera size={12} /> Photo Upload <span className="text-slate-300 normal-case tracking-normal ml-auto">(Required if FOUND)</span>
                    </label>
                    {!preview ? (
                      <label className="relative block border-2 border-dashed border-emerald-200/60 bg-white/40 backdrop-blur-sm p-10 rounded-[2rem] cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-400 transition-all duration-300 text-center group/upload overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover/upload:opacity-100 transition-opacity"></div>
                        <input type="file" onChange={handleImageChange} className="hidden" accept="image/jpeg, image/png, image/webp" />
                        <div className="w-16 h-16 bg-white shadow-xl shadow-emerald-900/5 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:-translate-y-1 transition-all">
                          <Camera size={28} strokeWidth={2.5} />
                        </div>
                        <p className="font-black text-xs md:text-sm text-slate-700 mb-1">Click to browse or drag image here</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JPEG, PNG up to 5MB</p>
                      </label>
                    ) : (
                      <div className="relative rounded-[2rem] overflow-hidden group/img shadow-xl ring-1 ring-slate-900/5">
                        <img src={preview} alt="Upload preview" className="w-full h-56 object-cover group-hover/img:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#102214]/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center pb-6">
                          <button
                            type="button"
                            onClick={() => { setPreview(null); setImage(null); }}
                            className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 active:scale-95 transition-all shadow-lg"
                          >
                            <X size={16} strokeWidth={3} /> DROP IMAGE
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 px-5 py-4 rounded-2xl w-full sm:w-auto shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Zap size={16} className="fill-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Smart Processing</h4>
                  <p className="text-[10px] font-bold text-slate-500">Your report is matched via AI</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[280px] bg-gradient-to-br from-[#102214] to-emerald-950 text-white p-5 rounded-[2rem] font-black uppercase tracking-[0.15em] shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group/btn overflow-hidden relative"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">SUBMIT REPORT</span>
                    <ArrowRight size={20} strokeWidth={3} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* BOTTOM DECORATION */}
        <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-300">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
            Protected by BAAFIN System <span className="mx-2">•</span> Community Lost & Found <br />
            <span className="text-emerald-600">Status: Active</span> <span className="mx-2">•</span> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}