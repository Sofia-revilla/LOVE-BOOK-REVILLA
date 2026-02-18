import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'broken' | 'letter' | 'secret' | null>(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    // Pumping Heart Loading Timer
    const timer = setTimeout(() => setLoading(false), 2500);
    
    const fetchMessages = async () => {
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    };
    fetchMessages();
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('love_messages').insert([
      { type: mode, recipient, sender: sender || 'Anonymous', content: message }
    ]);
    if (!error) {
      setRecipient(''); setSender(''); setMessage('');
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    }
  };

  // 1. LOADING SCREEN: Pumping Heart
  if (loading) return (
    <div className="loading-overlay">
      <div className="pumping-heart">❤️</div>
      <p>Opening LoveBook...</p>
    </div>
  );

  // 2. GATEWAY SCREEN
  if (!mode) return (
    <div className="gate">
      <h1 className="main-title">LoveBook 💌</h1>
      <div className="button-grid">
        <button className="btn-broken" onClick={() => setMode('broken')}>💔 Broken Heart</button>
        <button className="btn-love" onClick={() => setMode('letter')}>💌 Love Letter</button>
        <button className="btn-secret" onClick={() => setMode('secret')}>🕵️ Secret Admirer</button>
      </div>
    </div>
  );

  // 3. MAIN INTERFACE
  return (
    <div className="app-main">
      <div className="header-nav">
        <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
        <h2 className="mode-label">{mode === 'broken' ? '💔 Broken' : mode === 'letter' ? '❤️ Love' : '🕵️ Secret'}</h2>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSendMessage} className="love-form">
          <div className="input-row">
            <input placeholder="To:" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
            <input placeholder="From (Optional):" value={sender} onChange={(e) => setSender(e.target.value)} />
          </div>
          <textarea placeholder="Record your message..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          <button type="submit" className="send-btn">Send to Vault</button>
        </form>
      </div>

      <div className="envelope-wall">
        {messages.filter(m => m.type === mode).map(m => (
          <div 
            key={m.id} 
            className={`envelope ${openId === m.id ? 'is-open' : ''}`}
            onClick={() => setOpenId(openId === m.id ? null : m.id)}
          >
            <div className="envelope-flap"></div>
            <div className="envelope-paper">
              <div className="letter-content">
                <p><strong>To:</strong> {m.recipient}</p>
                <p><strong>From:</strong> {m.sender}</p>
                <hr />
                <p className="msg-text">{m.content}</p>
              </div>
            </div>
            <div className="envelope-base">
               <span className="seal">{mode === 'broken' ? '💔' : '❤️'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;