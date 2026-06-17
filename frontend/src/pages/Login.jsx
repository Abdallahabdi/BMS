import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Archive, Loader2 } from "lucide-react";
import { toast } from 'react-toastify';

const INPUT_CLS = 'w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-inner';

const Login = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [show,       setShow]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) { toast.error('Fadlan buuxi dhammaan meelaha banaan.'); return; }
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email: identifier, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (onLogin) onLogin(res.data.user);
      toast.success('Ku soo dhawoow Baafin!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ama password ayaa khaldan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-transparent">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] glass-dark flex-col justify-between p-14 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center bg-white p-3 rounded-2xl w-max shadow-xl">
          <img src="/logo.png" alt="Baafin Logo" className="h-14 w-auto" />
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Official Platform</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            Recover<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">your lost items.</span>
          </h1>
          <p className="text-slate-300 font-medium leading-relaxed max-w-sm drop-shadow">
            The centralized lost and found management system for Daarusalaam Park.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8 pt-8 border-t border-white/10">
          <div>
            <p className="text-2xl font-black text-white">98%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Success Rate</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">24/7</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Uptime</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl border border-white/60">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center mb-10 justify-center">
            <img src="/logo.png" alt="Baafin Logo" className="h-12 w-auto drop-shadow-md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 drop-shadow-sm">Welcome Back</h2>
            <p className="text-slate-700 font-medium text-sm">Login to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="email@example.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Password</label>
                <Link to="/forgotpassword" className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-widest drop-shadow-sm">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={INPUT_CLS + ' pr-11'}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Login</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Access</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            Protected by modern encryption
          </div>

          <p className="text-center text-sm font-medium text-slate-600 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-800 drop-shadow-sm">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;