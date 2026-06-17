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
  BarChart2, Award, Layers
} from "lucide-react";

// ─── Colour palette ──────────────────────────────────────────────────────────
const PALETTE = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

const StatCard = ({ icon, label, value, sub, color = "emerald", loading, link }) => {
  const clr = {
    emerald: { bg: "bg-emerald-500", grad: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30" },
    indigo:  { bg: "bg-indigo-500",  grad: "from-indigo-400 to-violet-500", shadow: "shadow-indigo-500/30" },
    amber:   { bg: "bg-amber-500",   grad: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/30" },
    red:     { bg: "bg-red-500",     grad: "from-red-400 to-rose-500",     shadow: "shadow-red-500/30" },
    cyan:    { bg: "bg-cyan-500",    grad: "from-cyan-400 to-blue-500",    shadow: "shadow-cyan-500/30" },
  };
  const theme = clr[color] || clr.emerald;
  
  const CardBody = (
    <>
      {/* Glowing background blob */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 ${theme.bg}/10 blur-[30px] rounded-full group-hover:${theme.bg}/20 transition-all duration-500`}></div>
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${theme.grad} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>

      <div className="flex justify-between items-start relative z-20">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${theme.grad} text-white shadow-lg ${theme.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          {icon}
        </div>
        {sub && <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${theme.bg}/10 text-${color}-600 border border-${color}-100/50`}>{sub}</span>}
      </div>
      <div className="relative z-20 mt-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1">{label}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
          {loading ? <span className="text-slate-200 animate-pulse">...</span> : value ?? "0"}
        </h3>
      </div>
    </>
  );

  const className = `group relative bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 flex flex-col gap-4 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden z-10 ${link ? 'cursor-pointer block' : ''}`;

  return link ? (
    <Link to={link} className={className}>
      {CardBody}
    </Link>
  ) : (
    <div className={className}>
      {CardBody}
    </div>
  );
};

// ─── Section heading ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon, title, sub }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">{icon}</div>
    <div>
      <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
      {sub && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</p>}
    </div>
  </div>
);

// ─── Custom tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 shadow-2xl">
      <p className="font-black mb-1 text-slate-300">{label}</p>
      {Array.isArray(payload) && payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const AdminStats = ({ toggleSidebar }) => {
  const [dash, setDash]     = useState({});
  const [items, setItems]   = useState({ byCategory: [], byZone: [] });
  const [trends, setTrends] = useState({ items: [], users: [], claims: [] });
  const [users, setUsers]   = useState({ recentUsers: [], trend: [] });
  const [claims, setClaims] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchAll = async () => {
   setLoading(true);
   setError(null);
   try {
     const [dashRes, itemsRes, trendsRes, usersRes, claimsRes] = await Promise.all([
       API.get("/stats/dashboard"),
       API.get("/stats/items"),
       API.get("/stats/trends?months=6"),
       API.get("/stats/users"),
       API.get("/stats/claims"),
     ]);
    setDash(dashRes.data?.data ?? {});
    setItems(itemsRes.data?.data ?? { byCategory: [], byZone: [] });
    setTrends(trendsRes.data?.data ?? { items: [], users: [], claims: [] });
    setUsers(usersRes.data?.data ?? { recentUsers: [], trend: [] });
    setClaims(claimsRes.data?.data ?? {});
    setLastFetch(new Date());
  } catch (err) {
    setError(err.response?.data?.message || "Failed to load statistics");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchAll(); }, []);

  // ── Build chart data ──────────────────────────────────────────────────────
  const trendData = Array.isArray(trends?.items)
    ? trends.items.map((d, i) => ({
        month:  d.month,
        Items:  d.count,
        Users:  Array.isArray(trends.users) && trends.users[i] ? trends.users[i].count : 0,
        Claims: Array.isArray(trends.claims) && trends.claims[i] ? trends.claims[i].count : 0,
      }))
    : [];

  const statusPieData = dash && dash.status
    ? [
        { name: "Pending",  value: dash.status.pending   },
        { name: "Verified", value: dash.status.verified  },
        { name: "Claimed",  value: dash.status.claimed   },
        { name: "Returned", value: dash.status.returned  },
      ].filter(d => d.value > 0)
    : [];

  const claimPieData = dash && dash.claims
    ? [
        { name: "Pending",  value: dash.claims.pending   },
        { name: "Approved", value: dash.claims.approved  },
        { name: "Rejected", value: dash.claims.rejected  },
      ].filter(d => d.value > 0)
    : [];

  const categoryBarData = Array.isArray(items?.byCategory)
    ? items.byCategory.slice(0, 8).map(c => ({ name: c._id || "Other", count: c.count }))
    : [];

  const zoneBarData = Array.isArray(items?.byZone)
    ? items.byZone.slice(0, 6).map(z => ({ name: z._id || "Unknown", count: z.count }))
    : [];

  const userTrendData = Array.isArray(users?.trend) ? users.trend : [];

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
        <p className="text-slate-900 font-black text-lg mb-2">Oops!</p>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={fetchAll} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Menu className="lg:hidden cursor-pointer text-slate-600" size={24} onClick={toggleSidebar} />
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
            </div>
            <p className="text-slate-400 font-bold">Real-time platform analytics and monitoring</p>
          </div>
          <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {lastFetch && <span className="text-[10px]">{lastFetch.toLocaleTimeString()}</span>}
          </button>
        </div>

        {/* ── Summary cards row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard loading={loading} label="Total Items"  value={dash?.items?.total}      color="emerald" icon={<Package size={18}/>} link="/admin/inventory" />
          <StatCard loading={loading} label="Total Users"  value={dash?.users?.total}      color="indigo"  icon={<Users size={18}/>} />
          <StatCard loading={loading} label="Total Claims" value={dash?.claims?.total}     color="amber"   icon={<FileCheck size={18}/>} />
          <StatCard loading={loading} label="Recovery Rate" value={`${dash?.recoveryRate ?? 0}%`} color="cyan" icon={<Award size={18}/>} />
        </div>

        {/* ── Large charts row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Area chart — all metrics over time */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<TrendingUp size={18}/>} title="Growth Trends" sub="6-month overview" />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  {[["items","#10b981"],["users","#6366f1"],["claims","#f59e0b"]].map(([key, clr]) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={clr} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={clr} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }} />
                <Area type="monotone" dataKey="Items"  stroke="#10b981" fill="url(#grad-items)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Users"  stroke="#6366f1" fill="url(#grad-users)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Claims" stroke="#f59e0b" fill="url(#grad-claims)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart — items by category */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<Layers size={18}/>} title="Items by Category" sub="Top 8 categories" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Items" radius={[8,8,0,0]}>
                  {categoryBarData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Pie charts row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

          {/* Item status pie */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<Package size={18}/>} title="Item Status" sub="Distribution" />
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {statusPieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Claim status pie */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<FileCheck size={18}/>} title="Claim Status" sub="Distribution" />
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={claimPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {claimPieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Zone bar chart */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<RotateCcw size={18}/>} title="Items by Park Zone" sub="Top 6 zones" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneBarData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Items" radius={[0,8,8,0]}>
                  {zoneBarData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── User growth + recent users ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* User growth area chart */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<Users size={18}/>} title="User Growth" sub="Monthly registrations" />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userTrendData}>
                <defs>
                  <linearGradient id="grad-user" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="New Users" stroke="#6366f1" fill="url(#grad-user)" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent users list */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <SectionTitle icon={<Clock size={18}/>} title="Recent Registrations" sub="Last 5 users" />
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* ✅ FIX: Check if recentUsers is an array before mapping */}
                {Array.isArray(users?.recentUsers) && users.recentUsers.length > 0 ? (
                  users.recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm uppercase">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${u.role === "admin" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {u.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-300 font-black uppercase text-[10px] tracking-widest py-8">No users yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Claims detail strip ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.isArray([
            { label: "Pending Claims",  value: dash?.claims?.pending,  color: "amber",   icon: <Clock size={18}/>, link: "/admin/inventory" },
            { label: "Approved Claims", value: dash?.claims?.approved, color: "emerald", icon: <CheckCircle size={18}/>, link: "/admin/inventory" },
            { label: "Rejected Claims", value: dash?.claims?.rejected, color: "red",     icon: <AlertCircle size={18}/>, link: "/admin/inventory" },
          ]) && [
            { label: "Pending Claims",  value: dash?.claims?.pending,  color: "amber",   icon: <Clock size={18}/>, link: "/admin/inventory" },
            { label: "Approved Claims", value: dash?.claims?.approved, color: "emerald", icon: <CheckCircle size={18}/>, link: "/admin/inventory" },
            { label: "Rejected Claims", value: dash?.claims?.rejected, color: "red",     icon: <AlertCircle size={18}/>, link: "/admin/inventory" },
          ].map((card, i) => (
            <StatCard key={i} loading={loading} {...card} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminStats;