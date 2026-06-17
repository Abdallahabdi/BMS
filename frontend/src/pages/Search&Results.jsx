import React, { useState, useEffect, useContext } from 'react';
import {
  Search, Heart, MapPin, Calendar, Filter, ArrowRight, ShieldCheck,
  Menu, Trash2, Smartphone, Shirt, FileText, Key, Wallet, Box,
  Layers, X, SlidersHorizontal, AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../api/api';
import { UserContext } from '../utils/UserContext';
import { toast } from 'react-toastify';

const CATEGORY_ICON = {
  Electronics: <Smartphone size={56} strokeWidth={1} />,
  Clothing: <Shirt size={56} strokeWidth={1} />,
  Documents: <FileText size={56} strokeWidth={1} />,
  Keys: <Key size={56} strokeWidth={1} />,
  Wallets: <Wallet size={56} strokeWidth={1} />,
};

const STATUS_CONFIG = {
  found:    { label: 'Found', bg: 'bg-emerald-500', text: 'text-white', dot: 'bg-emerald-400' },
  lost:     { label: 'Lost',  bg: 'bg-rose-500',    text: 'text-white', dot: 'bg-rose-400'    },
  claimed:  { label: 'Claimed', bg: 'bg-blue-500',  text: 'text-white', dot: 'bg-blue-400'    },
  returned: { label: 'Returned', bg: 'bg-amber-400', text: 'text-slate-900', dot: 'bg-amber-300' },
};

const ITEMS_PER_PAGE = 9;

export default function SearchPage({ toggleSidebar }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = ['All', 'Electronics', 'Clothing', 'Documents', 'Keys', 'Wallets', 'Other'];

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await API.get('/items?limit=1000');
      setItems(res.data.items || []);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      await API.delete(`/items/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const filtered = items.filter(i => {
    const mType = type === 'All' || i.itemType === type.toLowerCase();
    const mCat  = category === 'All' || i.category === category;
    const mSearch = [i.itemName, i.description, i.parkZone].join(' ').toLowerCase().includes(query.toLowerCase());
    return mType && mCat && mSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTypeChange = (v) => { setType(v); setPage(1); };
  const handleCategoryChange = (v) => { setCategory(v); setPage(1); };
  const handleQuery = (v) => { setQuery(v); setPage(1); };

  // When user clicks "View Details" first check if a match exists for this item.
  // If a match exists navigate to the match view; if not, show a friendly message.
  const handleViewDetails = async (item) => {
    if (!item?._id) return;
    try {
      await API.get(`/matches/${item._id}`);
      navigate(`/user-match/${item._id}`);
    } catch (err) {
      // If no match (404) show a gentle informative message; otherwise show generic error
      if (err.response?.status === 404) {
        toast.info('Waqtigan ma jiro wax isku eg oo nidaamka ku jira — waan ka xunnahay. Waxaad dooran kartaa inaad alaabta dib u diiwaangeliso ama sugto in qof la waafajiyo.')
      } else {
        toast.error('Waxaa dhacay qalad. Fadlan isku day mar kale.');
      }
    }
  };

  const activeFilters = (type !== 'All' ? 1 : 0) + (category !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans selection:bg-emerald-100">

      {/* ── TOP BAR ─────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="hidden sm:block text-sm font-black text-slate-700 tracking-tight">Official Registry</span>
          </div>
        </div>

        {/* Center Search */}
        <div className="relative flex-1 max-w-xl mx-4 lg:mx-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={e => handleQuery(e.target.value)}
            placeholder="Search by name, description, or location…"
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
          {query && (
            <button onClick={() => handleQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle + Count */}
        <button
          onClick={() => setFilterOpen(o => !o)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${filterOpen ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:block">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* ── FILTER DRAWER ───────────────────────── */}
      {filterOpen && (
        <div className="bg-white border-b border-slate-100 px-4 md:px-8 lg:px-12 py-4 shadow-sm">
          <div className="max-w-[1400px] mx-auto flex flex-wrap gap-6">
            {/* Type */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</p>
              <div className="flex gap-2">
                {['All', 'Lost', 'Found'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleTypeChange(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition border ${type === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => handleCategoryChange(c)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition border ${category === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {activeFilters > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => { setType('All'); setCategory('All'); setPage(1); }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest transition"
                >
                  <X size={14} /> Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-10">

        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              Item <span className="text-emerald-600">Catalog</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {loading ? 'Loading registry…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
              {(type !== 'All' || category !== 'All' || query) && ' · Filtered'}
            </p>
          </div>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20"
          >
            <AlertCircle size={16} /> Report Item
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3,4,5,6].map(n => (
              <div key={n} className="h-96 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))
          ) : paginated.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <Search size={36} className="text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">No results found</h3>
              <p className="text-sm text-slate-500 max-w-sm">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            paginated.map(item => {
              const sc = STATUS_CONFIG[item.itemType] || STATUS_CONFIG['lost'];
              const itemStatus = STATUS_CONFIG[item.status] || null;
              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-slate-50 overflow-hidden">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.itemName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                        {CATEGORY_ICON[item.category] || <Box size={56} strokeWidth={1} />}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.category || 'Unknown'}</span>
                      </div>
                    )}

                    {/* Badges row */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`${sc.bg} ${sc.text} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                        {sc.label}
                      </span>
                      {item.status && item.status !== item.itemType && itemStatus && (
                        <span className={`${itemStatus.bg} ${itemStatus.text} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                          {itemStatus.label}
                        </span>
                      )}
                    </div>

                    {/* Favorite */}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm border border-slate-100">
                      <Heart size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-black text-lg text-slate-900 leading-snug line-clamp-2">{item.itemName}</h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-1">#{item._id?.slice(-5).toUpperCase()}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col gap-1.5 mt-auto mb-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <MapPin size={13} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{item.parkZone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <Calendar size={13} className="text-emerald-500 shrink-0" />
                        <span>{item.dateTime ? new Date(item.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        View Details <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      {/* {user?.role === 'admin' && (
                        <button
                          onClick={(e) => handleDelete(item._id, e)}
                          className="w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > ITEMS_PER_PAGE && (
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm font-semibold text-slate-500">
              Showing <span className="font-black text-slate-900">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-black text-slate-900">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition border ${n === page ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900'}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}