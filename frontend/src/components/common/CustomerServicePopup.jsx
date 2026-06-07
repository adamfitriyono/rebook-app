import { useEffect, useRef, useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { CUSTOMER_SERVICE, CS_QUICK_REPLIES } from '../../utils/customerService';
import { sendSupportMessage } from '../../services/support';
import { toast } from '../../store/useToastStore';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: 'Halo! Saya asisten ReBook. Ada yang bisa saya bantu tentang beli/jual buku, pesanan, atau pembayaran?',
};

function toApiHistory(messages) {
  return messages.filter((m) => m.id !== 'welcome').map(({ role, content }) => ({ role, content }));
}

export default function CustomerServicePopup() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const history = toApiHistory(messages);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await sendSupportMessage(trimmed, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const fallback = err.response?.data?.error || 'Maaf, asisten AI sedang tidak tersedia. Silakan coba lagi nanti.';
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
      if (err.response?.status !== 503) {
        toast.error('Gagal mengirim pesan ke asisten AI');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-[80] sm:bg-black/20" onClick={() => setOpen(false)} aria-hidden />}

      <div className="fixed bottom-6 right-6 z-[85] flex flex-col items-end gap-3">
        {open && (
          <div className="w-[calc(100vw-2rem)] sm:w-[26rem] surface rounded-2xl shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[min(80vh,560px)]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary text-white px-5 py-4 flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <img src="/images/icon/customer-service.svg" alt="Customer Service" className="w-5 h-5" />
                  <h3 className="font-bold">{CUSTOMER_SERVICE.title}</h3>
                </div>
                <p className="text-sm text-white/90">{CUSTOMER_SERVICE.subtitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition" aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-light/50 dark:bg-gray-900/50 min-h-[280px]">
                {messages.map((msg, i) => (
                  <div key={msg.id || `${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'surface border rounded-bl-md text-heading'}`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 text-xs text-primary mb-1">
                          <Bot size={12} /> Asisten AI
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="surface border rounded-2xl rounded-bl-md px-3 py-2 text-sm text-subtle">Mengetik...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 shrink-0 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {CS_QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-muted hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pertanyaan..." maxLength={500} disabled={loading} className="input-field text-sm py-2 flex-1" />
                  <button type="submit" disabled={loading || !input.trim()} className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 shrink-0" aria-label="Kirim pesan">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${open ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'}`}
          aria-label={open ? 'Tutup customer service' : 'Buka customer service'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <img src="/images/icon/customer-service.svg" alt="Customer Service" className="w-6 h-6" />}
          <span className="text-sm font-semibold hidden sm:inline">{open ? 'Tutup' : 'Customer Service'}</span>
        </button>
      </div>
    </>
  );
}
