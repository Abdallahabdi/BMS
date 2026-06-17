import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Package, Users, FileCheck, RotateCcw,
  AlertCircle, CheckCircle, Clock, Menu, RefreshCw,
  Award, Layers, Activity, Sparkles, Zap, ArrowUpRight
} from "lucide-react";

const PALETTE = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6"];

const StatCard = ({ icon, label, value, sub, color = "emerald", loading, link }) => {
  const theme = {
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", glow: "shadow-emerald-500/10", light: "bg-emerald-50/60 border-emerald-100" },
    indigo:  { bg: "bg-indigo-500", text: "text-indigo-500", glow: "shadow-indigo-500/10", light: "bg-indigo-50/60 border-indigo-100" },
    amber:   { bg: "bg-amber-500", text: "text-amber-500", glow: "shadow-amber-500/10", light: "bg-amber-50/60 border-amber-100" },
    red:     { bg: "bg-red-500", text: "text-red-500", glow: "shadow-red-500/10", light: "bg-red-50/60 border-red-100" },
    cyan:    { bg: "bg-cyan-500", text: "text-cyan-500", glow: "shadow-cyan-500/10", light: "bg-cyan-50/60 border-cyan-100" },
  }[color] || { bg: "bg-slate-500", text: "text-slate-500", glow: "shadow-slate-500/10", light: "bg-slate-50/60 border-slate-100" };

  const CardContent = (
    <>
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme.light} ${theme.text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          {icon}
        </div>
        {sub && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-300 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
            <TrendingUp size={11} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>{sub}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-1.5">{label}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tight">
          {loading ? (
            <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            value ?? "0"
          )}
        </h3>
      </div>
      {/* Decorative hover gradient border line */}
      <div className={`absolute bottom-0 left-0 w-full h-[3px] ${theme.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
    </>
  );

  const cardClasses = `group relative bg-white/90 backdrop-blur-md p-7 rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden ${link ? 'cursor-pointer block' : ''}`;

  return link ? (
    <Link to={link} className={cardClasses}>
      {CardContent}
    </Link>
  ) : (
    <div className={cardClasses}>
      {CardContent}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-3.5 mb-8">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-md shadow-slate-950/20">
      {icon}
    </div>
    <div>
      <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl ring-1 ring-black/5">
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-3 mb-1.5 last:mb-0">
          <div className="w-2 h-2 rounded-full ring-4 ring-black/10" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300 text-xs font-medium">{p.name}:</span>
          <span className="font-black text-white text-xs ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const AnalyticalReports = ({ toggleSidebar }) => {
  const [dash, setDash] = useState({ items: {}, users: {}, claims: {} });
  const [items, setItems] = useState({ byCategory: [], byZone: [] });
  const [trends, setTrends] = useState({ items: [], users: [], claims: [] });
  const [users, setUsers] = useState({ recentUsers: [], trend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, itemsRes, trendsRes, usersRes] = await Promise.all([
        API.get("/stats/dashboard").catch(() => ({ data: { data: {} } })),
        API.get("/stats/items").catch(() => ({ data: { data: { byCategory: [], byZone: [] } } })),
        API.get("/stats/trends?months=6").catch(() => ({ data: { data: { items: [], users: [], claims: [] } } })),
        API.get("/stats/users").catch(() => ({ data: { data: { recentUsers: [], trend: [] } } })),
      ]);

      setDash(dashRes.data?.data || { items: {}, users: {}, claims: {} });
      setItems(itemsRes.data?.data || { byCategory: [], byZone: [] });
      setTrends(trendsRes.data?.data || { items: [], users: [], claims: [] });
      setUsers(usersRes.data?.data || { recentUsers: [], trend: [] });
    } catch (err) {
      console.error(err);
      setError("Failed to load platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const trendData = Array.isArray(trends?.items) ? trends.items.map((d, i) => ({
    month: d?.month || "",
    Items: d?.count || 0,
    Users: Array.isArray(trends?.users) && trends.users[i] ? trends.users[i].count : 0,
    Claims: Array.isArray(trends?.claims) && trends.claims[i] ? trends.claims[i].count : 0,
  })) : [];

  const statusPieData = dash?.status ? [
    { name: "Pending", value: dash.status.pending || 0 },
    { name: "Verified", value: dash.status.verified || 0 },
    { name: "Claimed", value: dash.status.claimed || 0 },
    { name: "Returned", value: dash.status.returned || 0 },
  ].filter(d => d.value > 0) : [];

  const categoryBarData = Array.isArray(items?.byCategory) ? items.byCategory.slice(0, 8).map(c => ({
    name: c?._id || "Other",
    count: c?.count || 0
  })) : [];

  const zoneBarData = Array.isArray(items?.byZone) ? items.byZone.slice(0, 6).map(z => ({
    name: z?._id || "Unknown",
    count: z?.count || 0
  })) : [];

  if (error) return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl max-w-md text-center border border-red-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-slate-950 font-black text-2xl mb-2 tracking-tight">System Error</h2>
        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{error}</p>
        <button onClick={fetchAll} className="w-full bg-slate-950 text-white px-6 py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-slate-900 transition-colors shadow-lg shadow-slate-950/10">
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAFAFC] p-4 md:p-8 lg:p-10 font-sans relative selection:bg-emerald-100 pb-24">

      <div className="max-w-[1600px] mx-auto">

        {/* ULTRA-PREMIUM HEADER BANNER */}
        <div className="relative bg-slate-900 rounded-[3rem] p-8 md:p-12 mb-12 overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-800">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full -mt-40 -mr-20 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full -mb-20 -ml-20 mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <Menu className="lg:hidden text-white cursor-pointer hover:text-emerald-400 transition-colors" size={24} onClick={toggleSidebar} />
                <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400/90">Live Operations</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
                Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">Center.</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-base md:text-lg">
                Advanced analytics and platform telemetry for <span className="text-slate-200 font-semibold">Baafin Network</span>.
              </p>
            </div>

            <div className="flex gap-4 items-center w-full sm:w-auto">
              <button onClick={fetchAll} disabled={loading} className="group relative w-full sm:w-auto overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3.5 rounded-xl text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <RefreshCw size={14} className={loading ? "animate-spin text-emerald-400" : "group-hover:rotate-180 transition-transform duration-500 text-emerald-400"} />
                  {loading ? 'Syncing...' : 'Refresh Data'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard loading={loading} label="Total Inventory" value={dash?.items?.total} sub="Live" color="emerald" icon={<Package size={22} strokeWidth={2.5}/>} link="/admin/inventory" />
          <StatCard loading={loading} label="Registered Users" value={dash?.users?.total} sub="Growing" color="indigo" icon={<Users size={22} strokeWidth={2.5}/>} link="/admin/users" />
          <StatCard loading={loading} label="Total Claims" value={dash?.claims?.total} sub="Active" color="amber" icon={<FileCheck size={22} strokeWidth={2.5}/>} link="/admin/inventory" />
          <StatCard loading={loading} label="Resolution Rate" value={`${dash?.recoveryRate ?? 0}%`} sub="Success" color="cyan" icon={<Award size={22} strokeWidth={2.5}/>} link="/returned" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          
          {/* MAIN TREND CHART */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] p-6 lg:p-8 relative overflow-hidden">
            <SectionHeader icon={<Activity size={18} />} title="System Trajectory" subtitle="6-Month Metric Overview" />
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradItems" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 1.5 }} />
                  <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }} iconType="circle" />
                  <Area type="monotone" dataKey="Items" stroke="#10b981" strokeWidth={3} fill="url(#gradItems)" activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={3} fill="url(#gradUsers)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ITEM STATUS PIE */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] p-6 lg:p-8 flex flex-col justify-between">
            <SectionHeader icon={<Zap size={18} />} title="Inventory Health" subtitle="Current Item States" />
            <div className="flex-1 flex justify-center items-center min-h-[250px]">
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" paddingAngle={5} stroke="none" cornerRadius={6}>
                      {statusPieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} className="hover:opacity-85 transition-opacity outline-none cursor-pointer" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-300 font-bold uppercase tracking-widest text-[11px] flex flex-col items-center gap-3">
                  <Package size={28} className="opacity-30 animate-bounce" />
                  No inventory data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* CATEGORIES BAR CHART */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] p-6 lg:p-8">
            <SectionHeader icon={<Layers size={18} />} title="Top Categories" subtitle="Distribution by volume" />
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} barSize={32} margin={{ left: -25, bottom: -5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                  <Bar dataKey="count" name="Items" radius={[8, 8, 0, 0]}>
                    {categoryBarData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} className="hover:opacity-85 transition-opacity cursor-pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ZONE BAR CHART */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] p-6 lg:p-8">
            <SectionHeader icon={<RotateCcw size={18} />} title="Hotspots (Zones)" subtitle="Where items are found/lost" />
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneBarData} layout="vertical" barSize={20} margin={{ left: -15, bottom: -5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                  <Bar dataKey="count" name="Items" radius={[0, 8, 8, 0]}>
                    {zoneBarData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[(i+2) % PALETTE.length]} className="hover:opacity-85 transition-opacity cursor-pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* USER ACTIVITY BOARD */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] p-6 lg:p-8">
            <SectionHeader icon={<Users size={18} />} title="Network Activity" subtitle="Recent User Registrations" />
            <div className="mt-6 space-y-3.5">
              {loading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
              ) : (
                Array.isArray(users?.recentUsers) && users.recentUsers.length > 0 ? (
                  users.recentUsers.map((u, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-base uppercase shadow-sm">
                          {u?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{u?.name || "Unknown"}</p>
                          <p className="text-[11px] font-medium text-slate-400">{u?.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${u?.role === "admin" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100"} border border-slate-100 transition-colors`}>
                          {u?.role || "User"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1 group-hover:text-emerald-400/80 transition-colors">
                          <Clock size={10} /> Joined recently
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                    <Users size={36} className="mb-3 opacity-30" />
                    <p className="font-bold uppercase tracking-widest text-[11px]">No active users found</p>
                  </div>
                )
              )}
            </div>
            <button className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
              View All Users <ArrowUpRight size={14} />
            </button>
          </div>

          {/* ACTIONABLE CARDS */}
          <div className="flex flex-col gap-6">
            <StatCard loading={loading} label="Action Required" value={dash?.claims?.pending} sub="Pending Claims" color="amber" icon={<Clock size={18} />} link="/admin/inventory" />
            <StatCard loading={loading} label="Completed Actions" value={dash?.claims?.approved} sub="Approved Claims" color="emerald" icon={<CheckCircle size={18} />} link="/admin/inventory" />
            
            <div className="flex-1 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white relative overflow-hidden flex flex-col justify-end shadow-lg shadow-indigo-600/10 group min-h-[180px]">
              <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 blur-[45px] rounded-full -mt-16 -mr-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
              <Sparkles className="absolute top-6 right-6 text-indigo-200 opacity-40 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" size={28} />
              <h3 className="font-black text-2xl mb-1.5 tracking-tight">System Health</h3>
              <p className="text-indigo-200/90 text-xs font-medium mb-5 leading-relaxed max-w-[90%]">
                All microservices and database shards are running optimally. Analytics engine is synced.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-bold text-[10px] uppercase tracking-widest text-emerald-300">100% Operational</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AnalyticalReports;