import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/api';

const FloatingMessageButton = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Ku soo dhawow, ${user?.name?.split(' ')[0]}! 👋 Waxaan ahay Baafin AI. Sideen kuu caawin karaa maanta?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]); 

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await API.post('/chatbot', { query: userText });
      const botResponse = res.data.response;
      const items = res.data.items || [];

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: botResponse, items }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: 'Waan ka xunnahay, khalad ayaa dhacay. Fadlan dib u tijaabi hadhow.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Badbaadada Xeerka Hooks (Halkan ayaa la dhigay si uusan koodhku u jabin)
  if (location.pathname === '/messages') return null;

  return (
    <>
      {/* Daaqadda Sheekada (Chat Window) */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[200] w-[340px] max-h-[520px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-slate-700/60"
          style={{
            background: 'linear-gradient(135deg, rgba(10,13,20,0.97) 0%, rgba(15,20,35,0.97) 100%)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Madaxa (Header) */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-700/50"
            style={{ background: 'rgba(16,185,129,0.12)' }}
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-black">Baafin AI</p>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">● Khadka K weyn</p>
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="p-1.5 text-slate-400 hover:text-emerald-400 transition"
              title="Fariimaha oo dhan"
            >
              <ExternalLink size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-red-400 transition"
              title="Xir"
            >
              <X size={15} />
            </button>
          </div>

          {/* Fariimaha (Messages Body) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '340px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${msg.from === 'bot' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                  {msg.from === 'bot' ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${msg.from === 'bot'
                  ? 'bg-slate-800/70 text-slate-200 rounded-tl-none border border-slate-700/40'
                  : 'bg-emerald-600 text-white rounded-tr-none'
                  }`}>
                  <p className="text-[13px] leading-relaxed">{msg.text}</p>
                  
                  {/* Alaabta la helay ama luntay (Items match) */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.items.map((item) => (
                        <div key={item._id} className="bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-600/40">
                          <p className="text-xs font-black text-emerald-400">{item.itemName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {item.itemType === 'lost' ? 'Luntay' : 'La Helay'} • {item.status === 'returned' ? 'La Celiyey' : item.status === 'verified' ? 'La Hubiyey' : 'Wuu Sugayaa'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-slate-800/70 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/40">
                  <Loader2 size={14} className="text-emerald-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Meesha Qoraalka (Input Area) */}
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-2xl border border-slate-700/50 px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Wax weydii Baafin AI..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition shrink-0"
                title="Dir"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badhanka Furitaanka (Toggle Button) */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-4 z-[200] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-emerald-600/30"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10b981, #059669)',
        }}
        title={isOpen ? 'Xir daaqadda' : 'Fur Baafin AI'}
      >
        {isOpen ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
      </button>
    </>
  );
};

export default FloatingMessageButton;