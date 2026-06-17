import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Image as ImageIcon, Send, Shield, Trash2, CheckCircle2, MessageSquare, ChevronLeft, Menu } from 'lucide-react';
import API from '../api/api';
import { toast } from 'react-toastify';

const MessagingPortal = ({ toggleSidebar }) => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showList, setShowList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Parse current user from token/local storage
    try {
      const stored = localStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (_) {}
    fetchClaims();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await API.get('/claims');
      // Hubso inay array tahay ka hor intaadan state-ka dhigin
      const data = res.data;
      if (Array.isArray(data)) {
        setClaims(data);
      } else if (data && Array.isArray(data.claims)) {
        setClaims(data.claims);
      } else {
        setClaims([]);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
      toast.error('Soo qaadashada dalabaadka way fashilantay.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClaim = async (claim) => {
    setSelectedClaim(claim);
    setShowList(false);
    try {
      const res = await API.get(`/claims/${claim._id}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Soo shubista farriimaha ayaa fashilantay.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClaim || sending) return;

    setSending(true);
    const text = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const tempMsg = {
      _id: 'temp-' + Date.now(),
      sender: currentUser,
      text,
      timestamp: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await API.post(`/claims/${selectedClaim._id}/messages`, { text });
      // Replace temp message with server response
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id).concat(res.data));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Farriinta ma bixin. Fadlan mar kale isku day.');
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      setNewMessage(text); // restore
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!selectedClaim) return;
    try {
      await API.delete(`/claims/${selectedClaim._id}/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
      toast.success('Farriinta waa la tirtiray.');
    } catch (error) {
      toast.error('Tirtiridda farriinta way fashilantay.');
    }
  };

  const isMyMessage = (msg) => {
    const myId = currentUser?.id || currentUser?._id;
    if (!myId) return false;
    const senderId = msg.sender?._id || msg.sender;
    return senderId?.toString() === myId?.toString();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F8F9FC] text-slate-800 overflow-hidden font-sans">

      {/* ===== CLAIMS LIST SIDEBAR ===== */}
      <aside className={`
        w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10
        ${showList ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={toggleSidebar} className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl mr-1 hover:bg-slate-200 transition">
               <Menu size={18} />
            </button>
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
              <MessageSquare size={15} className="text-emerald-600" />
            </div>
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Messages</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">{claims.length} active claims</p>
        </div>

        {/* Claims */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 p-8 text-center">
              <MessageSquare size={40} strokeWidth={1.5} />
              <p className="text-sm font-bold text-slate-600">No messages yet</p>
              <p className="text-xs">When you start a claim, your messages will appear here.</p>
            </div>
          ) : (Array.isArray(claims) ? claims : []).map((claim) => {
            const isActive = selectedClaim?._id === claim._id;
            const lastMsg = claim.messages?.[claim.messages.length - 1];
            return (
              <button
                key={claim._id}
                onClick={() => handleSelectClaim(claim)}
                className={`w-full text-left p-5 border-b border-slate-100 transition-all duration-200 group hover:bg-slate-50 ${isActive ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    claim.item?.status === 'returned' ? 'text-blue-600'
                    : claim.status === 'approved' ? 'text-green-600'
                    : claim.status === 'rejected' ? 'text-red-600'
                    : 'text-emerald-600'
                  }`}>
                    {claim.item?.status === 'returned' ? '✓ Returned' : claim.status === 'approved' ? '✓ Approved' : claim.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition truncate">{claim.item?.itemName || 'Shey'}</p>
                {lastMsg && (
                  <p className="text-xs text-slate-500 mt-1 truncate font-medium">{lastMsg.text}</p>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ===== MAIN CHAT AREA ===== */}
      <main className={`flex-1 flex flex-col bg-[#F8F9FC] ${!showList ? 'flex' : 'hidden md:flex'}`}>
        {selectedClaim ? (
          <>
            {/* Chat Header */}
            <header className="p-5 border-b border-slate-200 flex items-center gap-4 bg-white shadow-sm z-10"
            >
              <button
                onClick={() => setShowList(true)}
                className="md:hidden p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 shadow-inner rounded-2xl flex items-center justify-center">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 truncate">{selectedClaim.item?.itemName}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  Claim • {selectedClaim.claimer?.name || 'User'}
                </p>
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${
                selectedClaim.item?.status === 'returned'
                  ? 'text-blue-700 border-blue-200 bg-blue-50'
                  : selectedClaim.status === 'approved'
                  ? 'text-green-700 border-green-200 bg-green-50'
                  : selectedClaim.status === 'rejected'
                  ? 'text-red-700 border-red-200 bg-red-50'
                  : 'text-yellow-700 border-yellow-200 bg-yellow-50'
              }`}>
                {selectedClaim.item?.status === 'returned' ? 'RETURNED' : selectedClaim.status.toUpperCase()}
              </span>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F8F9FC]"
            >
               <div className="text-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 bg-white shadow-sm px-4 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest">
                   Safe & Encrypted Chat
                </span>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, i) => {
                  const isMe = isMyMessage(msg);
                  return (
                    <div key={msg._id || i} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${isMe ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        {isMe ? 'AH' : 'OF'}
                      </div>
                      {/* Bubble */}
                      <div className={`relative max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${isMe
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        } ${msg.isTemp ? 'opacity-60' : ''}`}>
                          <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                          <p className={`text-[9px] mt-1.5 font-bold ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.isTemp && ' · Diraya...'}
                          </p>
                        </div>
                        {/* Delete button for own messages */}
                        {isMe && !msg.isTemp && (
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-1.5 self-end"
                            title="Delete message"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-200 bg-white"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-3xl px-5 py-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
                  <textarea
                    rows={1}
                    className="flex-1 bg-transparent outline-none text-sm resize-none text-slate-900 placeholder-slate-400 py-1 font-medium"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition shrink-0 shadow-sm"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2 font-bold">Enter to send • Shift+Enter for new line</p>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500 p-8 text-center bg-[#F8F9FC]">
            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <MessageSquare size={36} className="text-slate-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">Select a Claim</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Choose a claim from the list to start messaging.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagingPortal;