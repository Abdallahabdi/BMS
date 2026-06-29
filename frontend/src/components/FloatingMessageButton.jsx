import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/api';

// Render text with **bold** markdown support
const renderText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-emerald-400 font-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { label: '📦 Alaabtay', query: 'Alaabtay maxay yihiin?' },
  { label: '📊 Tirakoob', query: 'Tirakoobka nidaamka' },
  { label: '📍 Goobaha', query: 'Goobaha beerta' },
  { label: '🧭 Sida', query: 'Sida nidaamka loo isticmaalo' },
];

const FloatingMessageButton = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Ku soo dhawow, **${user?.name?.split(' ')[0] || 'Saaxiib'}**! 👋\n\nWaxaan ahay **Baafin AI** — Kaaliyahaaga hoggaaminaya nidaamka Lost & Found. Su'aal walba waan ka jawaabi doonaa!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setShowSuggestions(false);

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
    } catch {
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

  if (location.pathname === '/messages') return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 z-[200] w-[360px] max-h-[560px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-slate-700/60"
          style={{
            background: 'linear-gradient(135deg, rgba(10,13,20,0.98) 0%, rgba(15,20,35,0.98) 100%)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 border-b border-slate-700/50 flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.10)' }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Bot size={19} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0d14]" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-black flex items-center gap-1.5">
                Baafin AI <Sparkles size={11} className="text-emerald-400" />
              </p>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                ● Online · Kaaliye Nidaamka
              </p>
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="p-1.5 text-slate-400 hover:text-emerald-400 transition rounded-lg hover:bg-white/5"
              title="Fariimaha oo dhan"
            >
              <ExternalLink size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-white/5"
              title="Xir"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scroll" style={{ maxHeight: '360px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.from === 'bot'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {msg.from === 'bot' ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.from === 'bot'
                    ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/40'
                    : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none shadow-lg shadow-emerald-600/20'
                }`}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-line">
                    {renderText(msg.text)}
                  </p>

                  {/* Item cards */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.items.map((item) => (
                        <div key={item._id} className="bg-slate-900/70 rounded-xl px-3 py-2.5 border border-slate-600/40 hover:border-emerald-500/30 transition-colors">
                          <p className="text-xs font-black text-emerald-400">{item.itemName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 capitalize">
                              {item.itemType === 'lost' ? '❌ Lumiyay' : '✅ La Helay'}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {item.status === 'returned' ? '🔄 Dib la celiyay'
                                : item.status === 'verified' ? '✔ La hubiyay'
                                : item.status === 'claimed' ? '📋 La codsaday'
                                : '⏳ Sugaya'}
                            </span>
                          </div>
                          {item.parkZone && (
                            <p className="text-[9px] text-slate-500 mt-0.5">📍 {item.parkZone}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/40">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap border-t border-slate-700/30 pt-3 flex-shrink-0">
              {QUICK_SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.query)}
                  className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-emerald-600/20 border border-slate-700/50 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 rounded-xl text-[10px] font-bold transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-700/50 flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-2xl border border-slate-700/50 px-3 py-2 focus-within:border-emerald-500/40 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Wax weydii Baafin AI..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
                title="Dir"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-4 z-[200] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: isOpen
            ? '0 10px 30px rgba(239,68,68,0.35)'
            : '0 10px 30px rgba(16,185,129,0.35)',
        }}
        title={isOpen ? 'Xir daaqadda' : 'Fur Baafin AI'}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <div className="relative">
            <MessageSquare size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
          </div>
        )}
      </button>
    </>
  );
};

export default FloatingMessageButton;