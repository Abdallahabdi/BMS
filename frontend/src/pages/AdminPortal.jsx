import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../utils/UserContext';
import API, { API_URL } from '../api/api';
import {
  Archive, Users, TrendingUp, Activity, ShieldCheck,
  Plus, ChevronRight, Menu, Trash2, Clock, AlertTriangle,
  CheckCircle2, BarChart3, Eye, ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const map = {
    pending:  'bg-amber-50  text-amber-700  border-amber-200',
    verified: 'bg-blue-50   text-blue-700   border-blue-200',
    claimed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-teal-50    text-teal-700    border-teal-200',
    rejected: 'bg-rose-50    text-rose-700    border-rose-200',
  };
  const dotColor = {
    pending: 'bg-amber-500 animate-pulse',
    verified: 'bg-blue-500',
    claimed: 'bg-emerald-500',
    returned: 'bg-teal-500',
    rejected: 'bg-rose-500'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || 'bg-slate-400'}`}></span>
      {status}
    </span>
  );
};

const AdminPortal = ({ toggleSidebar }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, claimsRes] = await Promise.all([
        API.get('/items'),
        API.get('/claims'),
      ]);
      const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data?.items || []);
      setItems(itemsData);
      setTotalItemsCount(itemsRes.data?.totalItems || itemsData.length);
      const claimsData = Array.isArray(claimsRes.data) ? claimsRes.data : (claimsRes.data?.claims || []);
      setClaims(claimsData.filter(c => c.status === 'pending'));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Permanently delete this item?')) return;
    try {
      await API.delete(`/items/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const stats = [
    { 
      label: 'Total Items',    
      value: totalItemsCount, 
      icon: <Archive size={20} />,    
      iconBg: 'bg-blue-50 text-blue-600',
      borderClass: 'border-slate-200 hover:border-blue-300',
      link: '/admin/inventory' 
    },
    { 
      label: 'Recovered',      
      value: items.filter(i => ['claimed','returned'].includes(i.status)).length, 
      icon: <TrendingUp size={20} />, 
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderClass: 'border-slate-200 hover:border-emerald-300',
      link: '/returned' 
    },
    { 
      label: 'Pending Verif.', 
      value: claims.length,   
      icon: <AlertTriangle size={20}/>, 
      iconBg: 'bg-amber-50 text-amber-600',
      borderClass: 'border-slate-200 hover:border-amber-300',
      link: null 
    },
    { 
      label: 'Active Users',   
      value: '—',             
      icon: <Users size={20} />,       
      iconBg: 'bg-violet-50 text-violet-600',
      borderClass: 'border-slate-200 hover:border-violet-300',
      link: '/users' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 p-4 md:p-8 lg:p-12 font-sans relative overflow-hidden selection:bg-emerald-100 selection:text-slate-900 pb-24">
      {/* BACKGROUND AURA */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/20 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-100/20 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* MOBILE MENU */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={toggleSidebar} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 transition">
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-base tracking-tight text-slate-800">ADMIN PORTAL</span>
        </div>

        {/* PAGE TITLE & ACTION ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
             <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Authorized Session</span>
             </div>
             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
               Control <span className="text-emerald-600">Center</span>
             </h1>
             <p className="text-sm text-slate-500 font-medium mt-0.5">
               Welcome back, <span className="font-bold text-slate-800">{user?.name || 'Admin'}</span> · System Administrator
             </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/reports" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm">
              <BarChart3 size={16} /> Analytics
            </Link>
            <Link to="/add" className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10">
              <Plus size={16} /> Add Item
            </Link>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((s, i) => {
            const Card = (
              <div className={`group bg-white p-5 rounded-2xl border ${s.borderClass} shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${s.iconBg}`}>
                    {s.icon}
                  </div>
                  {s.link && <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors group-hover:translate-x-0.5" />}
                </div>
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-black leading-none text-slate-900 tracking-tight">
                    {loading ? <span className="text-slate-300">—</span> : s.value.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            );
             return s.link ? <Link key={i} to={s.link} className="flex flex-col">{Card}</Link> : <div key={i} className="flex flex-col">{Card}</div>;
          })}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* VERIFICATION QUEUE */}
          <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-sm">Verification Queue</h2>
              </div>
              {claims.length > 0 && (
                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                  {claims.length} Pending
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px]">
              {loading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : claims.length === 0 ? (
                <div className="py-24 text-center">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue is empty</p>
                </div>
              ) : (
                claims.map((claim, idx) => (
                  <div key={idx} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm leading-snug">{claim.item?.itemName || 'Unknown Item'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">By {claim.claimer?.name}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {new Date(claim.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <Link to={`/admin/verify-claim/${claim._id}`} className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                      <Eye size={14} /> Review Claim
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT ITEMS TABLE */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Recent Reports</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Latest items in the registry</p>
              </div>
              <Link to="/admin/inventory" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-4">Item Details</th>
                    <th className="px-5 py-4 hidden md:table-cell">Reporter</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 hidden lg:table-cell">Registry Date</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1,2,3,4,5].map(n => (
                      <tr key={n}>
                        <td colSpan={5} className="px-5 py-4">
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                  ) : items.slice(0, 8).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors shrink-0">
                            <Archive size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-emerald-600 transition-colors">{item.itemName}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{item._id?.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-slate-600 font-semibold">{item.reportedBy?.name || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => handleDeleteItem(item._id, e)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && (
                <div className="py-24 text-center text-xs font-bold uppercase tracking-wider text-slate-400">No reports in the system yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;