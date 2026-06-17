import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../api/api';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  ShieldCheck,
  Users,
  History,
  LogOut,
  ChevronRight,
  Archive,
  Menu,
  X,
  Activity,
  Sparkles,
  PackageCheck,
  Bell
} from 'lucide-react';

const Sidebar = ({ user, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'Report Item', path: '/add', icon: <PlusCircle size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'Catalog', path: '/results', icon: <Archive size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'Returned Items', path: '/returned', icon: <PackageCheck size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'My Claims', path: '/messages', icon: <MessageSquare size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} strokeWidth={2.5} />, role: 'user' },
    { name: 'My Profile', path: '/profile', icon: <User size={20} strokeWidth={2.5} />, role: 'user' },
    // Admin section
    { name: 'Analytics', path: '/admin/reports', icon: <Activity size={20} strokeWidth={2.5} />, role: 'admin' },
    { name: 'Manage Users', path: '/users', icon: <Users size={20} strokeWidth={2.5} />, role: 'admin' },
    { name: 'Inventory', path: '/admin/inventory', icon: <Archive size={20} strokeWidth={2.5} />, role: 'admin' },
    { name: 'Activity Logs', path: '/audit-logs', icon: <History size={20} strokeWidth={2.5} />, role: 'admin' },
  ];

  const filteredItems = navItems.filter(item =>
    item.role === 'user' || (item.role === 'admin' && user?.role === 'admin')
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#04080F]/80 backdrop-blur-md z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-gradient-to-b from-[#070B12] to-[#0A0F1A] text-slate-300 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isMobileOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : '-translate-x-full'} 
        lg:translate-x-0 border-r border-white/[0.05]
      `}>
        {/* TOP GLOW (Decorative) */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2"></div>

        {/* LOGO AREA */}
        <div className="p-8 flex items-center justify-between mb-2 relative z-10">
          <Link to="/" className="flex items-center justify-center group bg-white p-3 rounded-2xl shadow-lg border border-emerald-100/20 w-full" onClick={() => setIsMobileOpen(false)}>
            <img src="/logo.png" alt="Baafin Logo" className="h-12 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-5 space-y-2 overflow-y-auto pt-2 pb-8 custom-scrollbar relative z-10">
          {filteredItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const isAdminItem = item.role === 'admin';

            return (
              <React.Fragment key={item.path}>
                {isAdminItem && filteredItems[idx - 1]?.role === 'user' && (
                  <div className="px-5 pt-8 pb-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-emerald-500" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Management</p>
                  </div>
                )}
                
                <Link
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    group relative flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 overflow-hidden
                    ${isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                    }
                  `}
                >
                  {/* Active Background & Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 rounded-2xl border border-emerald-500/20 pointer-events-none"></div>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#10b981]"></div>
                  )}

                  {/* Hover Background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`
                      transition-colors duration-300
                      ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400/80'}
                    `}>
                      {item.icon}
                    </div>
                    <span className="tracking-wide leading-none">{item.name}</span>
                  </div>

                  {isActive && (
                    <ChevronRight size={14} className="text-emerald-500/60 relative z-10" />
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* USER PROFILE CARD */}
        {user && (
          <div className="p-5 relative z-10">
            <div className="relative group overflow-hidden rounded-3xl bg-[#0f1522] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-[15px] shadow-lg border border-white/10 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-105 transition-transform duration-300">
                  {user.avatar ? (
                    <img src={`${API_URL}${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-100 truncate">{user.name}</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 opacity-80">{user.role}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
