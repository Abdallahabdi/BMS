import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Archive,
  Search,
  PlusCircle,
  UserCircle,
  LogOut,
  Menu,
  Bell,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ user, onLogout, toggleSidebar }) {
  const t = (key) => {
    const map = {
      brand: 'BAAFIN',
      home: 'Home',
      lost_items: 'Lost Items',
      found_items: 'Found Items',
      report_item: 'Report Item',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      admin: 'Admin',
      logout: 'Logout'
    };
    return map[key] || key;
  };

  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const navLinks = [
    { name: user?.role === 'admin' ? t('admin') : t('home'), path: '/' },
    { name: t('lost_items'), path: '/results?type=lost' },
    { name: t('found_items'), path: '/results?type=found' },
    { name: t('report_item'), path: '/add' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="h-[80px] glass border-b border-slate-100/50 sticky top-0 z-50 px-4 lg:px-12 flex items-center justify-between shadow-sm">

      {/* LEFT: BRAND & MOBILE TOGGLE */}
      <div className="flex items-center gap-4 lg:gap-8">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 hover:bg-slate-100/50 rounded-xl transition text-slate-800"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="flex items-center group">
          <img src="/logo.png" alt="Baafin Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
        </Link>
      </div>

      {/* CENTER: NAV LINKS (DESKTOP) */}
      <div className="hidden lg:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${isActive(link.path)
              ? 'text-emerald-700 bg-emerald-100/80 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* RIGHT: USER ACTIONS */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button className="relative p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-slate-300/50">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-black text-slate-900 leading-none">{user.name}</span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">{user.role}</span>
            </div>

            <div className="relative group">
              <button className="w-10 h-10 rounded-2xl bg-white/50 flex items-center justify-center text-slate-600 border border-slate-300 transition-all hover:border-emerald-400 overflow-hidden shadow-sm">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={24} />
                )}
              </button>

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-3 w-56 glass rounded-3xl shadow-2xl border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-[60]">
                <div className="p-4 border-b border-slate-200/50 mb-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('profile')}</p>
                  <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 rounded-2xl transition">
                  <UserCircle size={18} /> {t('profile')}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 rounded-2xl transition">
                    <ShieldCheck size={18} /> {t('admin')}
                  </Link>
                )}

                <div className="h-px bg-slate-200/50 my-2 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-2xl transition"
                >
                  <LogOut size={18} /> {t('logout')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-5 py-2.5 text-xs font-black text-slate-700 hover:text-emerald-700 transition uppercase tracking-widest bg-white/50 rounded-xl shadow-sm hover:shadow-md">
              {t('login')}
            </Link>
            <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 uppercase tracking-widest">
              {t('register')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
