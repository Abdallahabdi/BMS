import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, Trash2, ArrowRight, Menu, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { toast } from 'react-toastify';

export default function Notifications({ toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Soo shubista ogeysiisyada ayaa fashilantay.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Ogeysiiska waa la tirtiray");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Tirtiridda ogeysiiska way fashilantay");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => API.patch(`/notifications/${n._id}/read`)));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("Dhammaan waa lala socdaa!");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans selection:bg-indigo-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Bell size={24} />
             </div>
             <div>
               <h1 className="font-black text-3xl tracking-tighter text-slate-900">
                 Notifications<span className="text-indigo-600">.</span>
               </h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Updates and System Alerts</p>
             </div>
          </div>
        </div>
        
        {unreadCount > 0 && (
           <button onClick={markAllAsRead} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Mark All as Read
           </button>
        )}
      </div>

      <div className="max-w-4xl">
         {loading ? (
           <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
           </div>
         ) : notifications.length === 0 ? (
           <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                 <Bell size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-slate-400 text-sm max-w-sm">When there's an update regarding your claims, matches, or items, it will appear here.</p>
           </div>
         ) : (
           <div className="space-y-4">
             {notifications.map((notif) => (
               <div 
                 key={notif._id} 
                 className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${notif.isRead ? 'bg-white border-slate-100 shadow-sm' : 'bg-indigo-50/30 border-indigo-100 shadow-md shadow-indigo-100/50'}`}
               >
                  {!notif.isRead && (
                     <span className="absolute top-6 right-6 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border-2 border-white shadow-sm"></span>
                  )}
                  
                  <div className="flex gap-5 items-start">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {notif.type === 'match' ? <AlertCircle size={20} /> : notif.type === 'claim' ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                     </div>
                     
                     <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${notif.isRead ? 'text-slate-400' : 'text-indigo-500'}`}>
                           {notif.type || 'Alert'}
                        </p>
                        <p className={`text-base font-medium mb-3 leading-relaxed pr-8 ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                           {notif.message}
                        </p>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                           
                           <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notif.isRead && (
                                 <button onClick={() => markAsRead(notif._id)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800">
                                    Mark Read
                                 </button>
                              )}
                              <button onClick={() => deleteNotification(notif._id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700">
                                 Delete
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
