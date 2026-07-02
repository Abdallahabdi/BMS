import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { toast } from 'react-toastify';
import {
  MapPin, Plus, Trash2, Flower2, Gamepad2, Car, Utensils,
  DoorOpen, MoonStar, Eye, EyeOff, Archive, Image, ImageOff,
  Loader2, CheckCircle2, Sparkles, RefreshCw
} from 'lucide-react';


const AdminParkZones = () => {
  const [zones, setZones] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'images'

  const [form, setForm] = useState({
    name: ''
  });

  useEffect(() => {
    fetchZones();
    fetchItems();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await API.get('/parkzones');
      setZones(res.data || []);
    } catch {
      toast.error('Khalad: Goobaha ma soo shubi karin');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const res = await API.get('/items?includeReturned=true&limit=50');
      const data = res.data?.items || res.data || [];
      // Only items with images
      setItems(Array.isArray(data) ? data.filter(i => i.image) : []);
    } catch {
      toast.error('Khalad: Alaabta ma soo shubi karin');
    } finally {
      setItemsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Magaca goobta waa waajib');
    try {
      setAddLoading(true);
      await API.post('/parkzones', form);
      toast.success('✅ Goob cusub si guul leh ayaa loo daray!');
      setForm({ name: '' });
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Goobta ku darida way fashilantay');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirayso goobtan?')) return;
    try {
      await API.delete(`/parkzones/${id}`);
      toast.success('Goobta waa la tirtiray');
      fetchZones();
    } catch {
      toast.error('Tirtiristu way fashilantay');
    }
  };

  const handleToggleImage = async (itemId) => {
    try {
      setTogglingId(itemId);
      const res = await API.patch(`/parkzones/items/${itemId}/toggle-image`);
      setItems(prev => prev.map(i =>
        i._id === itemId ? { ...i, imageVisible: res.data.imageVisible } : i
      ));
      toast.success(res.data.imageVisible ? '🟢 Sawirku wuu muuqdaa hadda' : '🔴 Sawirka waa la qariyay');
    } catch {
      toast.error('Toggle-ga way fashilantay');
    } finally {
      setTogglingId(null);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-emerald-600 uppercase tracking-[0.25em] text-xs font-black">Admin Management</p>
        <h1 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 tracking-tight">
          Park Zone & Image Control
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Ku dar goobaha beerta & xukum sawirrada alaabta
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'zones'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <MapPin size={13} /> Goobaha Beerta
          </span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'images'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <Image size={13} /> Sawirrada Alaabta
          </span>
        </button>
      </div>

      {/* ─── TAB: ZONES ─── */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ADD FORM */}
          <div className="xl:col-span-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Plus size={18} />
                </div>
                <h2 className="font-black text-slate-900">Goob Cusub Ku Dar</h2>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                    Magaca Goobta *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Goobta Ciyaarta"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium"
                  />
                </div>


                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-emerald-600/10 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {addLoading ? 'Waa la daraa...' : 'Ku Dar Goobta'}
                </button>
              </form>
            </div>
          </div>

          {/* ZONES LIST */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500" />
                  <h2 className="font-black text-slate-900 text-sm">Goobaha Beerta ({zones.length})</h2>
                </div>
                <button
                  onClick={fetchZones}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  title="Cusboonaysii"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 size={24} className="text-emerald-500 animate-spin" />
                </div>
              ) : zones.length === 0 ? (
                <div className="py-20 text-center">
                  <MapPin size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goob malaha</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {zones.map((zone, idx) => (
                    <div key={zone._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300 w-5 text-center">{idx + 1}</span>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-current/10">
                          <span className="text-emerald-500">
                            <MapPin size={18} />
                          </span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{zone.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(zone._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Tirtir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: IMAGE VISIBILITY ─── */}
      {activeTab === 'images' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3">
            <Eye size={16} className="text-amber-600 shrink-0" />
            <p className="text-amber-800 text-xs font-bold">
              Marka userku alaab soo xareeyaa, sawirku wuu qarsooma. Adiga (Admin) ayaa go'aamsata haddii sawirku u muuqdo dadweynaha.
            </p>
          </div>

          {itemsLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 size={24} className="text-emerald-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <ImageOff size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ma jiraan alaab leh sawiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => (
                <div
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    {/* Visible indicator overlay */}
                    <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                      item.imageVisible
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-300 backdrop-blur-sm'
                    }`}>
                      {item.imageVisible ? <Eye size={9} /> : <EyeOff size={9} />}
                      {item.imageVisible ? 'Muuqda' : 'Qarsooma'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-black text-slate-900 text-sm truncate">{item.itemName}</h3>
                    <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                      {item.category} • {item.parkZone || '—'}
                    </p>
                    <p className="text-[9px] text-slate-300 font-medium mt-0.5 capitalize">
                      {item.itemType} • {item.status}
                    </p>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggleImage(item._id)}
                      disabled={togglingId === item._id}
                      className={`mt-3 w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        item.imageVisible
                          ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      } disabled:opacity-50`}
                    >
                      {togglingId === item._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : item.imageVisible ? (
                        <><EyeOff size={13} /> Qar Sawirka</>
                      ) : (
                        <><Eye size={13} /> Muuji Sawirka</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminParkZones;
