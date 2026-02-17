import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

// Initialize Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Types for stability
type Mode = 'broken' | 'letter' | 'secret' | null;

interface LoveMessage {
  id: number;
  type: string;
  recipient: string;
  content: string;
  created_at: string;
}

const FallingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; duration: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const newHeart = {
        id,
        left: Math.random() * 100 + 'vw',
        duration: Math.random() * 3 + 2 + 's',
      };
      setHearts((prev) => [...prev, newHeart]);
      setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 5000);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {hearts.map((h) => (
        <span key={h.id} className="heart" style={{ left: h.left, animationDuration: h.duration }}>
          ❤️
        </span>
      ))}
    </>
  );
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>(null);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LoveMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('love_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setMessages(data as LoveMessage[]);
    };

    fetchMessages();
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const { error } = await supabase
      .from('love_messages')
      .insert([{ type: mode, recipient, content: message }]);

    if (error) {
      alert("Error syncing: " + error.message);
    } else {
      alert("Message recorded! ❤️");
      setRecipient('');
      setMessage('');
      // Refresh local list
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data as LoveMessage[]);
    }
    setIsSending(false);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loader-heart">💖</div>
      <h2>Opening LoveBook...</h2>
    </div>
  );

  if (!mode) return (
    <div className="gate">
      <FallingHearts />
      <h1 className="title">LoveBook 💌</h1>
      <div className="button-group">
        <button className="btn-broken" onClick={() => setMode('broken')}>💔 Broken Heart</button>
        <button className="btn-love" onClick={() => setMode('letter')}>💌 Love Letter</button>
        <button className="btn-secret" onClick={() => setMode('secret')}>🕵️ Secret Admirer</button>
      </div>
    </div>
  );

  return (
    <div className="app-main">
      <FallingHearts />
      <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
      
      <div className="form-container">
        <h2>{mode === 'broken' ? 'Healing Wall' : mode === 'letter' ? 'Love Letter' : 'Secret Vault'}</h2>
        <form onSubmit={handleSendMessage}>
          <input required placeholder="To:" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <textarea required placeholder="Message:" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" className="submit-btn" disabled={isSending}>
            {isSending ? 'Syncing...' : 'Send to LoveBook ❤️'}
          </button>
        </form>
      </div>

      <div className="message-wall">
        {messages.filter(m => m.type === mode).map(m => (
          <div key={m.id} className="message-card">
            <p><strong>To:</strong> {m.recipient}</p>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;