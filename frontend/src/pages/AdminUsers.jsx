import React, { useEffect, useState } from 'react';
import API from '../api/api';
import {
  Users, Trash2, ShieldCheck, Menu, UserCircle, X,
  Search, Edit3, Crown, User as UserIcon, Mail, Phone, Calendar, ChevronDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminUsers({ toggleSidebar }) {
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [query, setQuery]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      const data = Array.isArray(res.data) ? res.data : res.data?.users || [];
      setUsers(data);
      setFiltered(data);
    } catch {
      toast.error('Soo shubista isticmaalayaasha ayaa fashilantay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    ));
    setCurrentPage(1);
  }, [query, users]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filtered.slice(startIndex, startIndex + itemsPerPage);

  const changeRole = async (userId, currentRole) => {
    if (!window.confirm("Change this user's role?")) return;
    try {
      setActionLoading(true);
      await API.put(`/users/${userId}`, { role: currentRole === 'admin' ? 'user' : 'admin' });
      toast.success('Doorka waa la cusbooneysiiyey');
      loadUsers();
    } catch { toast.error('Cusboonaysiinta doorku way fashilantay'); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser?._id) return;
    try {
      setSaving(true);
      await API.put(`/users/${editingUser._id}`, editingUser);
      toast.success('Isticmaalaha waa la cusbooneysiiyey');
      setEditingUser(null);
      loadUsers();
    } catch { toast.error('Cusboonaysiintu way fashilantay'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      setActionLoading(true);
      await API.delete(`/users/${userId}`);
      toast.success('Isticmaalaha waa la tirtiray');
      loadUsers();
    } catch { toast.error('Tirtiristu way fashilantay'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 lg:p-10 font-sans pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <div className="flex items-start gap-3 md:gap-4">
          <button onClick={toggleSidebar} className="lg:hidden mt-1 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 active:scale-95 transition-transform">
            <Menu size={20} />
          </button>
          <div>
            <p className="text-emerald-600 uppercase tracking-[0.25em] text-[10px] sm:text-xs font-black">
              Admin Dashboard
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mt-1 text-slate-900 tracking-tight">
              User Management
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">
              Manage all registered accounts
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        {[
          { label: 'Total Users', value: users.length, icon: <Users size={18} /> },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: <Crown size={18} /> },
          { label: 'Standard', value: users.filter(u => u.role === 'user').length, icon: <UserIcon size={18} /> }
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white border border-slate-200 shadow-sm rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-md transition-all ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}
          >
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-0">
                <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest truncate">
                  {stat.label}
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 md:text-slate-900 truncate">
                  {stat.value}
                </h2>
              </div>

              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8">
        <div className="relative">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-3.5 pl-11 md:pl-14 pr-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-700 placeholder:text-slate-400 font-medium transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 md:p-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 md:p-20 text-center">
            <UserCircle size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-left text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <th className="p-6">User</th>
                    <th className="hidden md:table-cell">Contact</th>
                    <th>Role</th>
                    <th className="hidden lg:table-cell">Joined</th>
                    <th className="text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u) => (
                    <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all last:border-0">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 border border-slate-200 ${u.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {u.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">{u.name || 'No Name'}</h3>
                            <p className="text-slate-500 text-[10px] font-mono font-medium mt-0.5">ID: {u._id?.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden md:table-cell font-medium text-slate-600">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" />{u.email || '—'}
                          </span>
                          {u.phone && <span className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={14} className="text-slate-300" />{u.phone}</span>}
                        </div>
                      </td>

                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {u.role === 'admin' ? <Crown size={12} /> : <UserIcon size={12} />}
                          {u.role}
                        </span>
                      </td>

                      <td className="hidden lg:table-cell font-medium text-slate-600">
                        <span className="text-sm flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      <td className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Edit user"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => changeRole(u._id, u.role)}
                            disabled={actionLoading}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-50"
                            title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          >
                            <ShieldCheck size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            disabled={actionLoading}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards (visible on small screens) */}
            <div className="md:hidden divide-y divide-slate-100 bg-white">
              {currentUsers.map(u => (
                <div key={u._id} className="p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border border-slate-200 ${u.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.name?.slice(0,2).toUpperCase() || 'US'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-slate-900 text-base truncate">{u.name || 'No Name'}</h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${u.role === 'admin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{u.email || '—'}</p>
                      {u.phone && <p className="text-slate-400 text-xs mt-0.5">{u.phone}</p>}
                      <p className="text-slate-400 text-[10px] mt-1 font-mono">ID: {u._id?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button 
                      onClick={() => setEditingUser({ ...u })} 
                      className="flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>

                    <button 
                      onClick={() => changeRole(u._id, u.role)} 
                      disabled={actionLoading} 
                      className="flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck size={14} /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>

                    <button 
                      onClick={() => deleteUser(u._id)} 
                      disabled={actionLoading} 
                      className="flex items-center justify-center gap-1.5 text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm max-w-xs mx-auto sm:max-w-none sm:mx-0">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:hover:bg-slate-50 transition-all font-bold"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-black text-slate-700 text-sm sm:text-base">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:hover:bg-slate-50 transition-all font-bold"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-black text-slate-900">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                <input
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={editingUser.role || 'user'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition appearance-none pr-10"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}