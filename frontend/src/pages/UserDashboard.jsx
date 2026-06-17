import React, { useEffect, useState, useContext } from 'react';
import {
  MessageSquare,
  Box,
  PlusCircle,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Menu,
  Sparkles,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../api/api';
import { UserContext } from '../utils/UserContext';
import { toast } from 'react-toastify';

const UserDashboard = ({ toggleSidebar }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [itemsRes, matchesRes, claimsRes, notifRes] = await Promise.all([
        API.get('/items/my-items'),
        API.get('/matches').catch(() => ({ data: [] })),
        API.get('/claims').catch(() => ({ data: [] })),
        API.get('/notifications').catch(() => ({ data: [] }))
      ]);

      setItems(Array.isArray(itemsRes?.data) ? itemsRes.data : []);
      setMatches(Array.isArray(matchesRes?.data) ? matchesRes.data : []);
      setClaims(Array.isArray(claimsRes?.data) ? claimsRes.data : []);
      setNotifications(Array.isArray(notifRes?.data) ? notifRes.data : []);

    } catch (error) {
      console.error(error);
      toast.error("Ku guuldareystay in la keeno xogta dashboard-ka");
    } finally {
      setLoading(false);
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const safeMatches = Array.isArray(matches) ? matches : [];
  const safeClaims = Array.isArray(claims) ? claims : [];
  const notifList = Array.isArray(notifications) ? notifications : [];

  const activeCasesCount = safeItems.filter(
    i => i?.status !== 'returned' && i?.status !== 'claimed'
  ).length;

  const resolvedCount = safeItems.filter(
    i => i?.status === 'claimed' || i?.status === 'returned'
  ).length;

  const getDate = (d) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  };

  const getTime = (d) => {
    const date = new Date(d);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyles = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'returned':
        return {
          badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'claimed':
      case 'approved':
        return {
          badge: 'text-teal-700 bg-teal-50 border border-teal-200',
          dot: 'bg-teal-500'
        };
      case 'matched':
        return {
          badge: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
          dot: 'bg-indigo-500 animate-pulse'
        };
      case 'lost':
        return {
          badge: 'text-rose-700 bg-rose-50 border border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'found':
        return {
          badge: 'text-sky-700 bg-sky-50 border border-sky-200',
          dot: 'bg-sky-500'
        };
      default:
        return {
          badge: 'text-amber-700 bg-amber-50 border border-amber-200',
          dot: 'bg-amber-500'
        };
    }
  };

  const stats = [
    { label: 'Registered Items', value: safeItems.length, icon: <Box size={20} />, bgColor: 'bg-blue-50 text-blue-600' },
    { label: 'AI Matches', value: safeMatches.length, icon: <Cpu size={20} />, bgColor: 'bg-purple-50 text-purple-600' },
    { label: 'Active Claims', value: safeClaims.length, icon: <MessageSquare size={20} />, bgColor: 'bg-amber-50 text-amber-600' },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircle2 size={20} />, bgColor: 'bg-emerald-50 text-emerald-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 lg:p-12 font-sans selection:bg-emerald-100">
      <div className="max-w-7xl mx-auto">
        
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={toggleSidebar} className="text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={20} />
          </button>
          <div className="font-bold text-slate-800 tracking-tight text-sm">DASHBOARD</div>
        </div>

        {/* WELCOME */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-emerald-600">{user?.name ?? 'Guest'}</span> 👋
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">
              You currently have <span className="text-slate-800 font-bold">{activeCasesCount} active</span> cases needing attention.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/report')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-slate-900/10 active:scale-95 self-start sm:self-center"
          >
            <PlusCircle size={18} />
            Report New Item
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl transition-colors ${s.bgColor}`}>
                  {s.icon}
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">Stats</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TABLE (Recent Items) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900">Recent Items</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  Total: {safeItems.length}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase tracking-wider bg-slate-50/70 border-b border-slate-100">
                      <th className="p-4 font-bold">Item Name</th>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            Loading dashboard data...
                          </div>
                        </td>
                      </tr>
                    ) : safeItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                          No items registered yet.
                        </td>
                      </tr>
                    ) : (
                      safeItems.slice(0, 5).map((item, i) => {
                        const styles = getStatusStyles(item?.status);

                        return (
                          <tr key={item._id || i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-4 font-semibold text-slate-900">{item?.itemName}</td>
                            <td className="p-4 text-slate-500 font-medium">{getDate(item?.dateTime)}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${styles.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                                {item?.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => navigate('/messages')}
                                className="inline-flex items-center justify-center p-2 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all group-hover:translate-x-0.5"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {safeItems.length > 5 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <button onClick={() => navigate('/my-items')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  View All Registered Items
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS BOX */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                Notifications
              </h2>
              {notifList.length > 0 && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>

            {notifList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center flex-grow">
                <p className="text-slate-400 text-sm font-medium">All caught up!</p>
                <p className="text-slate-400 text-xs mt-1">No new notifications.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 subtle-scrollbar">
                {notifList.map((n, i) => (
                  <div key={n._id || i} className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-colors">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{n?.message}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                      <Clock size={10} />
                      {getTime(n?.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;