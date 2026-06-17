import React, { useState, useEffect } from 'react';
import API, { API_URL, getImageUrl } from '../api/api';
import {
  User, Mail, Phone, Edit3, Save, Camera, Menu, X,
  ShieldCheck, LogOut, Calendar, Users
} from 'lucide-react';
import { toast } from 'react-toastify';

const FIELD_INPUT = 'w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition disabled:bg-transparent disabled:border-transparent disabled:text-slate-900 disabled:px-0 shadow-inner backdrop-blur-sm';

export default function Profile({ toggleSidebar, setUser: setGlobalUser }) {
  const [user,    setUser]    = useState(null);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', gender: '' });
  const [loading, setLoading] = useState(false);
  const [avatar,  setAvatar]  = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    API.get('/auth/me').then(res => {
      const d = res?.data?.user || res?.data;
      if (!d) return;
      setUser(d);
      setForm({ name: d.name || '', email: d.email || '', phone: d.phone || '', gender: d.gender || '' });
      setPreview(d.avatar ? getImageUrl(d.avatar) : '');
    }).catch(() => toast.error('Ku guuldareystay in la keeno Profile-ka'));
  }, []);

  useEffect(() => {
    return () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v || ''));
      if (avatar) data.append('avatar', avatar);
      const res = await API.put('/auth/profile', data);
      const updated = res?.data?.user;
      if (!updated) return;
      setUser(updated);
      if (setGlobalUser) setGlobalUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      toast.success('Profile-ka si guul leh ayaa loo casriyeeyay');
    } catch (err) { console.error(err); toast.error('Casriyeyntu way fashilantay'); }
    finally { setLoading(false); }
  };

  if (!user) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 lg:p-10 font-sans pb-20">

      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center gap-3 mb-6 glass p-4 rounded-2xl border border-white/60">
        <button onClick={toggleSidebar} className="p-2.5 bg-white/80 border border-slate-200 rounded-xl shadow-sm text-slate-600">
          <Menu size={20} />
        </button>
        <span className="font-black text-lg text-slate-900 tracking-tight">My Profile</span>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">Account <span className="text-emerald-600">Management</span></h1>
          <p className="text-sm text-slate-700 mt-1 font-medium drop-shadow-sm">Update your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: AVATAR CARD */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl border border-white/60 overflow-hidden shadow-2xl">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 relative">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, #ffffff 0%, transparent 60%)'}} />
              </div>

              <div className="px-6 pb-6 -mt-12">
                {/* Avatar */}
                <div className="relative w-20 h-20 mb-4">
                  <div className="w-20 h-20 rounded-2xl ring-4 ring-white/80 overflow-hidden bg-slate-100 shadow-xl">
                    {preview ? (
                      <img src={preview} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-500 transition shadow-lg border-2 border-white/80">
                      <Camera size={14} />
                      <input type="file" hidden accept="image/*" onChange={e => {
                        const f = e.target.files?.[0]; if (!f) return; setAvatar(f); setPreview(URL.createObjectURL(f));
                      }} />
                    </label>
                  )}
                </div>

                <h2 className="font-black text-slate-900 text-lg leading-tight">{user.name}</h2>
                <p className="text-sm text-slate-600 font-medium">{user.email}</p>

                <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-2">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-bold capitalize">{user.role}</span>
                  </div>
                  {user.gender && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Users size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-bold capitalize">{user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : user.gender}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Calendar size={14} className="text-slate-500 shrink-0" />
                    <span className="font-medium">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl border border-white/60 overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-slate-200/50 flex items-center justify-between bg-white/30 backdrop-blur-sm">
                <div>
                  <h2 className="font-black text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Edit your details below</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                  >
                    <Edit3 size={15} /> Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white/80 rounded-xl transition shadow-sm bg-white/50"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Full Name</label>
                    {editing ? (
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={FIELD_INPUT + ' pl-10'} placeholder="Full Name" />
                      </div>
                    ) : <p className="text-slate-900 font-black py-1 text-lg">{form.name || '—'}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Email</label>
                    {editing ? (
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={FIELD_INPUT + ' pl-10'} placeholder="Email" />
                      </div>
                    ) : <p className="text-slate-800 font-bold py-1">{form.email || '—'}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Phone</label>
                    {editing ? (
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={FIELD_INPUT + ' pl-10'} placeholder="Phone Number" />
                      </div>
                    ) : <p className="text-slate-800 font-bold py-1">{form.phone || '—'}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Gender</label>
                    {editing ? (
                      <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={FIELD_INPUT}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : <p className="text-slate-800 font-bold py-1 capitalize">{form.gender === 'male' ? 'Male' : form.gender === 'female' ? 'Female' : form.gender || '—'}</p>}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-3 rounded-xl bg-white/60 border border-slate-300/80 text-sm font-black text-slate-700 hover:bg-white transition shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition shadow-lg shadow-emerald-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Save size={15} />
                      {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}