import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock, Phone, EyeOff, Eye, ArrowRight, Archive, Loader2, ChevronDown } from "lucide-react";


const INPUT_CLS = 'w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-inner';
const ICON_INPUT = INPUT_CLS + ' pl-11';

const Register = ({ onLogin }) => {
  const t = (key) => {
    const map = {
      join_today: 'Join Today',
      protect_what_matters: 'Protect what',
      protect_highlight: 'Matters',
      register_blurb: 'Register your items, search for lost ones, or return found belongings securely.',
      create_account: 'Create Account',
      fill_form: 'Please fill in your details below.',
      full_name_label: 'Full Name',
      full_name_placeholder: 'Enter your name',
      email_label: 'Email',
      email_placeholder: 'Enter your email',
      phone_label: 'Phone',
      phone_placeholder: 'Enter your phone number',
      gender_label: 'Gender',
      choose: 'Choose',
      male: 'Male',
      female: 'Female',
      password_label: 'Password',
      password_placeholder: 'Enter password',
      confirm_password_label: 'Confirm Password',
      confirm_password_placeholder: 'Re-enter password',
      already_have_account: 'Already have an account?',
      login: 'Login'
    };
    return map[key] || key;
  };
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const { name, phone, email, gender, password, confirmPassword } = form;
    if (!name || !phone || !email || !gender || !password || !confirmPassword) {
      toast.warn('Fadlan buuxi dhammaan meelaha banaan.'); return false;
    }
    if (password.length < 8) { toast.error('Password-ka waa inuu ugu yaraan ahaado 8 xarfood.'); return false; }
    if (password !== confirmPassword) { toast.error('Password-yadu isma waafaqsana.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await API.post('/auth/register', { name: form.name, email: form.email.trim(), password: form.password, phone: form.phone.trim(), gender: form.gender });
      toast.success('Akoonka si guul leh ayaa loo sameeyay!');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (onLogin) onLogin(res.data.user);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Diiwaangelintu way fashilantay');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans bg-transparent">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[40%] glass-dark flex-col justify-between p-14 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative z-10 flex items-center bg-white p-3 rounded-2xl w-max shadow-xl">
          <img src="/logo.png" alt="Baafin Logo" className="h-14 w-auto" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">{t('join_today')}</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {t('protect_what_matters')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{t('protect_highlight')}</span>
          </h1>
          <p className="text-slate-300 font-medium leading-relaxed max-w-sm drop-shadow">
            {t('register_blurb')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 pt-8 border-t border-white/10">
          {['Quickly report lost or found items', 'Get notified when matches occur', 'Secure verification for claims'].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium drop-shadow">
              <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-lg glass p-10 rounded-3xl shadow-2xl border border-white/60 my-6">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center mb-10 justify-center">
            <img src="/logo.png" alt="Baafin Logo" className="h-12 w-auto drop-shadow-md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 drop-shadow-sm">{t('create_account')}</h2>
            <p className="text-slate-700 font-medium text-sm">{t('fill_form')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('full_name_label')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="name" value={form.name} onChange={handleChange} className={ICON_INPUT} placeholder={t('full_name_placeholder')} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('email_label')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className={ICON_INPUT} placeholder={t('email_placeholder')} required />
              </div>
            </div>

            {/* Phone + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('phone_label')}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="phone" value={form.phone} onChange={handleChange} className={ICON_INPUT} placeholder={t('phone_placeholder')} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('gender_label')}</label>
                <div className="relative">
                  <select name="gender" value={form.gender} onChange={handleChange} className={INPUT_CLS + ' appearance-none pr-10'} required>
                    <option value="">{t('choose')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('password_label')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className={ICON_INPUT + ' pr-11'} placeholder={t('password_placeholder')} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('confirm_password_label')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} className={ICON_INPUT + ' pr-11'} placeholder={t('confirm_password_placeholder')} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>{t('create_account')}</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-600 mt-8">
            {t('already_have_account')} {' '}
            <Link to="/login" className="font-black text-emerald-700 hover:text-emerald-800 drop-shadow-sm">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;