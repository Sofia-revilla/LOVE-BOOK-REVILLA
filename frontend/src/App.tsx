import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Types for stability
type Mode = 'broken' | 'letter' | 'secret' | null;

interface LoveMessage {
  id: number;
  type: string;
  sender: string;
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
  const [messages, setMessages] = useState<LoveMessage[]>([]);

  useEffect(() => {
    // 1. Simulate Loading
    const timer = setTimeout(() => setLoading(false), 2000);

    // 2. Use Supabase (Clears the 'unused' warning)
    const fetchInitialData = async () => {
        const { data } = await supabase.from('love_messages').select('*').limit(10);
        if (data) setMessages(data as LoveMessage[]);
    };
    
    fetchInitialData();
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader-heart">💖</div>
        <h2>Opening LoveBook...</h2>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="gate">
        <FallingHearts />
        <h1>LoveBook 💌</h1>
        <div className="button-group">
          <button className="btn-broken" onClick={() => setMode('broken')}>💔 Broken Heart</button>
          <button className="btn-love" onClick={() => setMode('letter')}>💌 Love Letter</button>
          <button className="btn-secret" onClick={() => setMode('secret')}>🕵️ Secret Admirer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-main">
      <FallingHearts />
      <button onClick={() => setMode(null)}>← Back</button>
      <h2>{mode.toUpperCase()} Vault</h2>
      <p>Items in vault: {messages.length}</p>
    </div>
  );
}

export default App;
// THIS FIXES THE main