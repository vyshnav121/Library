import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AIChatbot() {
  const { api, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', content: `Hello ${user?.name || 'there'}! I'm your AI Library Assistant. How can I help you today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message });
      setChat(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my brain. Please try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-95 group"
        >
          <MessageSquare className="h-7 w-7" />
          <span className="absolute -top-12 right-0 bg-surface text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-primary/10">
            Need help? Ask me!
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-surface border border-border w-80 sm:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Library Assistant</h3>
                <div className="flex items-center text-[10px] text-white/70 font-bold uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  Always Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-surface border border-border text-text rounded-tl-none shadow-sm'
                }`}>
                   <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-surface border-t border-border">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-background border-transparent focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl py-3 pl-4 pr-12 text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
