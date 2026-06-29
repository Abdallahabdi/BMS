import React, { useState, useEffect, useContext } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Trash2,
  Box,
  ChevronLeft,
  ChevronRight,
  Archive,
  Smartphone,
  Shirt,
  FileText,
  Key,
  Wallet,
  Plus,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../api/api';
import { UserContext } from '../utils/UserContext';
import { toast } from 'react-toastify';

const AdminInventory = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingItem, setEditingItem] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [togglingImageId, setTogglingImageId] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchInventory();
  }, [currentPage, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await API.get('/items', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          includeReturned: 'true'
        }
      });

      setItems(res.data.items || res.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Waxaa fashilmay soo shubista alaabta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await API.delete(`/items/${id}`);
      toast.success('Waa la tirtiray');
      fetchInventory();
    } catch {
      toast.error('Tirtiristu way fashilantay');
    }
  };

  const openEdit = (item) => {
    setEditImageFile(null);
    const ownerId = item.reportedBy?._id || item.reportedBy || null;
    
    // XALKA DATE-TIME: U baddal qaabka uu input-ka html-ka aqbalayo (YYYY-MM-DDTHH:MM)
    let formattedDate = '';
    if (item.dateTime) {
      formattedDate = new Date(item.dateTime).toISOString().substring(0, 16);
    }

    setEditingItem({ ...item, reportedBy: ownerId, dateTime: formattedDate });
  };

  const handleEditChange = (key, value) => {
    setEditingItem(prev => ({ ...prev, [key]: value }));
  };

  const handleEditImage = (e) => {
    const f = e.target.files && e.target.files[0];
    setEditImageFile(f || null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem?._id) return;
    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('itemName', editingItem.itemName || '');
      formData.append('category', editingItem.category || '');
      formData.append('itemType', editingItem.itemType || 'lost');
      
      if (editingItem.status !== undefined) formData.append('status', editingItem.status);
      if (editingItem.description !== undefined) formData.append('description', editingItem.description);
      if (editingItem.color !== undefined) formData.append('color', editingItem.color);
      if (editingItem.parkZone !== undefined) formData.append('parkZone', editingItem.parkZone);
      if (editingItem.additionalInfo !== undefined) formData.append('additionalInfo', editingItem.additionalInfo);
      if (editingItem.dateTime !== undefined) formData.append('dateTime', editingItem.dateTime);
      if (editImageFile) formData.append('image', editImageFile);

      await API.patch(`/items/${editingItem._id}`, formData);

      toast.success('Waa la cusboonaysiiyay xogta alaabta');
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  // XALKA BADHANKA QARINTA/MUUJINTA SAWIRKA:
  const handleToggleImageVisibility = async (item) => {
    try {
      setTogglingImageId(item._id);
      const nextVisibility = !item.imageVisible;

      // Halkan waxaan u diraynaa { isVisible: true/false } si backend-ku u baddalo
      const res = await API.patch(`/parkzones/items/${item._id}/toggle-image`, { isVisible: nextVisibility });
      
      // La tacaal haddii uu res.data ama res.data.data soo noqdo
      const updatedVisibility = res.data?.data?.imageVisible !== undefined 
        ? res.data.data.imageVisible 
        : (res.data?.imageVisible !== undefined ? res.data.imageVisible : nextVisibility);

      setItems(prev => prev.map(i =>
        i._id === item._id ? { ...i, imageVisible: updatedVisibility } : i
      ));
      
      toast.success(updatedVisibility ? '🟢 Sawirku wuu muuqdaa' : '🔴 Sawirka waa la qariyay');
    } catch (err) {
      console.error(err);
      toast.error('Toggle-ga way fashilantay');
    } finally {
      setTogglingImageId(null);
    }
  };

  const getItemIcon = category => {
    switch (category) {
      case 'Electronics':
        return <Smartphone size={18} />;
      case 'Clothing':
        return <Shirt size={18} />;
      case 'Documents':
        return <FileText size={18} />;
      case 'Keys':
        return <Key size={18} />;
      case 'Wallets':
        return <Wallet size={18} />;
      default:
        return <Box size={18} />;
    }
  };

  // Stats-ka si ammaan ah u xisaabi
  const validItems = Array.isArray(items) ? items : [];
  const recoveredCount = validItems.filter(i => i.status === 'returned' || i.status === 'claimed').length;
  const pendingCount = validItems.filter(i => i.status === 'pending' || i.status === 'lost' || i.status === 'found').length;
  const successRate = validItems.length > 0 ? Math.round((recoveredCount / validItems.length) * 100) : 0;

  const stats = [
    { label: 'Total Items (Page)', value: validItems.length, icon: <Archive size={18} /> },
    { label: 'Recovered', value: recoveredCount, icon: <CheckCircle2 size={18} /> },
    { label: 'Pending', value: pendingCount, icon: <Clock size={18} /> },
    { label: 'Success Rate', value: `${successRate}%`, icon: <CheckCircle2 size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 p-4 sm:p-6 md:p-8 font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <p className="text-emerald-600 uppercase tracking-[0.25em] text-xs font-black">
            Admin Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 text-slate-900 tracking-tight">
            Inventory Control
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
            Manage all lost & found records
          </p>
        </div>

        <button
          onClick={() => navigate('/add')}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="truncate">
                <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest truncate">
                  {stat.label}
                </p>
                <h2 className="text-2xl md:text-3xl font-black mt-2 text-slate-900 truncate">
                  {stat.value}
                </h2>
              </div>

              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
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
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Dib ugu celi boga 1 marka wax la raadinayo
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-3.5 pl-12 md:pl-14 pr-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-700 placeholder:text-slate-400 font-medium transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* TABLE & MOBILE CARDS */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : validItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold text-sm uppercase tracking-wider">
            Wax alaab ah lama helin
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-left text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <th className="p-6">Item</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-right pr-8">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {validItems.map(item => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-all last:border-0"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <>
                                <img
                                  src={getImageUrl(item.image)}
                                  className={`w-full h-full object-cover transition-all ${!item.imageVisible ? 'opacity-30 grayscale' : ''}`}
                                  alt=""
                                />
                                {!item.imageVisible && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <EyeOff size={16} className="text-slate-600" />
                                  </div>
                                )}
                              </>
                            ) : (
                              getItemIcon(item.category)
                            )}
                          </div>

                          <div className="truncate max-w-[200px]">
                            <h3 className="font-black text-slate-900 truncate">{item.itemName}</h3>
                            <p className="text-slate-500 text-sm font-medium mt-0.5 truncate">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="font-medium text-slate-600 text-sm">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="font-medium text-slate-600 text-sm max-w-[150px] truncate">
                        {item.parkZone || '—'}
                      </td>

                      <td>
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase font-black tracking-widest">
                          {item.status}
                        </span>
                      </td>

                      <td className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          {item.image && (
                            <button
                              onClick={() => handleToggleImageVisibility(item)}
                              disabled={togglingImageId === item._id}
                              className={`p-2.5 rounded-xl border transition-colors ${
                                item.imageVisible
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                              } disabled:opacity-50`}
                              title={item.imageVisible ? 'Qar Sawirka' : 'Muuji Sawirka'}
                            >
                              {togglingImageId === item._id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : item.imageVisible ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/admin/verify/${item._id}`)}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                            title="Verify"
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          <button
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Edit"
                            onClick={() => {
                              const ownerId = item.reportedBy?._id || item.reportedBy || null;
                              if (user?.role !== 'admin' && user?._id !== ownerId) {
                                toast.error('Adigu xaq uma lihid inaad wax ka bedesho alaabtan');
                                return;
                              }
                              openEdit(item);
                            }}
                          >
                            <Edit3 size={16} />
                          </button>

                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-slate-100">
              {validItems.map(item => (
                <div key={item._id} className="p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <>
                          <img src={getImageUrl(item.image)} className={`w-full h-full object-cover ${!item.imageVisible ? 'opacity-30 grayscale' : ''}`} alt="" />
                          {!item.imageVisible && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <EyeOff size={14} className="text-slate-600" />
                            </div>
                          )}
                        </>
                      ) : (
                        getItemIcon(item.category)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-slate-900 text-base truncate">{item.itemName}</h3>
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider flex-shrink-0">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium">
                        {item.category} • {item.parkZone || 'Unknown'}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                    <button 
                      onClick={() => navigate(`/admin/verify/${item._id}`)} 
                      className="flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <CheckCircle2 size={14} /> Verify
                    </button>

                    <button 
                      className="flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      onClick={() => {
                        const ownerId = item.reportedBy?._id || item.reportedBy || null;
                        if (user?.role !== 'admin' && user?._id !== ownerId) {
                          toast.error('Adigu xaq uma lihid inaad wax ka bedesho alaabtan');
                          return;
                        }
                        openEdit(item);
                      }}
                    >
                      <Edit3 size={14} /> Edit
                    </button>

                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="flex items-center justify-center gap-1.5 text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 md:mt-8 bg-white border border-slate-200 p-3 rounded-2xl shadow-sm max-w-xs mx-auto sm:max-w-none sm:mx-0">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:hover:bg-slate-50 transition-all font-bold"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="font-black text-slate-700 text-sm sm:text-base">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:hover:bg-slate-50 transition-all font-bold"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="font-black text-lg text-slate-900">Update Item</h2>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">Update the details of this item accurately</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-5 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Item Name</label>
                <input 
                  value={editingItem.itemName || ''} 
                  onChange={e => handleEditChange('itemName', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                <input 
                  value={editingItem.category || ''} 
                  onChange={e => handleEditChange('category', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Type</label>
                <select 
                  value={editingItem.itemType || 'lost'} 
                  onChange={e => handleEditChange('itemType', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm"
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Park Zone</label>
                <input 
                  value={editingItem.parkZone || ''} 
                  onChange={e => handleEditChange('parkZone', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={editingItem.dateTime || ''} 
                  onChange={e => handleEditChange('dateTime', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Color</label>
                <input 
                  value={editingItem.color || ''} 
                  onChange={e => handleEditChange('color', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea 
                  value={editingItem.description || ''} 
                  onChange={e => handleEditChange('description', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium h-24 resize-none shadow-sm" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Additional Info</label>
                <input 
                  value={editingItem.additionalInfo || ''} 
                  onChange={e => handleEditChange('additionalInfo', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                <select 
                  value={editingItem.status || 'pending'} 
                  onChange={e => handleEditChange('status', e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium shadow-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="matched">Matched</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sawirka (Optional)</label>
                <div className="mt-1 flex items-center justify-center p-3 bg-white border border-dashed border-slate-300 rounded-xl shadow-sm">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleEditImage} 
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer" 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 active:scale-[0.99] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading} 
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-500 disabled:opacity-50 active:scale-[0.99] transition-all flex items-center justify-center shadow-md shadow-emerald-600/10"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;