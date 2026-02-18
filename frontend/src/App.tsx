import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// --- Background Component for Falling Hearts ---
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
      // Remove heart after animation finishes
      setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 5000);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hearts-layer">
      {hearts.map((h) => (
        <span key={h.id} className="heart-drop" style={{ left: h.left, animationDuration: h.duration }}>
          {Math.random() > 0.5 ? '❤️' : '💖'}
        </span>
      ))}
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'broken' | 'letter' | 'secret' | null>(null);
  const [flipping, setFlipping] = useState(false);
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

  const handleModeChange = (newMode: 'broken' | 'letter' | 'secret') => {
    setFlipping(true);
    setTimeout(() => {
      setMode(newMode);
      setFlipping(false);
    }, 600); // Matches CSS flip duration
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('love_messages').insert([
      { 
        type: mode, 
        recipient, 
        sender: sender || 'Anonymous', 
        content: message 
      }
    ]);

    if (!error) {
      setRecipient(''); setSender(''); setMessage('');
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    }
  };

  // 1. LOADING SCREEN
  if (loading) return (
    <div className="loading-overlay">
      <div className="pumping-heart">❤️</div>
      <p>Opening LoveBook...</p>
    </div>
  );

  // 2. GATEWAY SCREEN (BOOK LOG)
  if (!mode) return (
    <div className="book-container">
      <div className={`book-cover ${flipping ? 'is-flipping' : ''}`}>
        <div className="book-content">
          <h1 className="book-title">LoveBook 💌</h1>
          <p className="book-subtitle">Record your journey...</p>
          <div className="pixel-art-heart">💖</div>
        </div>

        <div className="bookmarks">
          <button className="tab-broken" onClick={() => handleModeChange('broken')}>
            <span className="tab-text">Broken</span>
          </button>
          <button className="tab-love" onClick={() => handleModeChange('letter')}>
            <span className="tab-text">Love</span>
          </button>
          <button className="tab-secret" onClick={() => handleModeChange('secret')}>
            <span className="tab-text">Secret</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 3. MAIN INTERFACE (WRITING PAGE)
  return (
    <div className="app-main">
      <FallingHearts />
      
      <div className="header-nav">
        {/* Updated to use the oval back-btn class */}
        <button className="back-btn" onClick={() => setMode(null)}>← Close Book</button>
      </div>

      <div className="form-wrapper">
        <h2 className="mode-header">
          {mode === 'broken' ? 'Record the pain' : 
           mode === 'letter' ? 'Write a Letter' : 'Share a Secret'}
        </h2>
        
        <form onSubmit={handleSendMessage} className="love-form">
          <input placeholder="To" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
          <input placeholder="From (Optional)" value={sender} onChange={(e) => setSender(e.target.value)} />
          <textarea placeholder="Type your message here..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          
          <button type="submit" className={`send-btn btn-${mode}`}>
            {mode === 'broken' ? 'Broken' : mode === 'letter' ? 'Love' : 'Secret'} ❤️
          </button>
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
               <div className="postage-stamp">
                 <span className="stamp-emoji">
                   {m.type === 'broken' ? '🥀' : m.type === 'letter' ? '💖' : '🕵️'}
                 </span>
               </div>
               <span className="seal">{mode === 'broken' ? '💔' : '❤️'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;