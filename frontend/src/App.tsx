import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function App() {
  const [mode, setMode] = useState<'broken' | 'letter' | 'secret' | null>(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, []);

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
      // Refresh local list
      const { data } = await supabase.from('love_messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    }
  };

  if (!mode) return (
    <div className="gate">
      <h1>LoveBook 💌</h1>
      <div className="button-group">
        <button className="btn-broken" onClick={() => setMode('broken')}>💔 Broken Heart</button>
        <button className="btn-love" onClick={() => setMode('letter')}>💌 Love Letter</button>
        <button className="btn-secret" onClick={() => setMode('secret')}>🕵️ Secret Admirer</button>
      </div>
    </div>
  );

  return (
    <div className="app-main">
      <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
      
      <form onSubmit={handleSendMessage} className="form-container">
        <h3>{mode === 'broken' ? 'Release the pain' : 'Record the Love'}</h3>
        <input placeholder="To:" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
        <input placeholder="From (Optional):" value={sender} onChange={(e) => setSender(e.target.value)} />
        <textarea placeholder="Message:" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button type="submit" className="submit-btn">Send to Vault</button>
      </form>

      <div className="wall">
        {messages.filter(m => m.type === mode).map(m => (
          <div 
            key={m.id} 
            className={`shape-card ${mode} ${openId === m.id ? 'is-open' : ''}`}
            onClick={() => setOpenId(openId === m.id ? null : m.id)}
          >
            <div className="shape-wrapper">
              <span className="main-emoji">
                {mode === 'broken' ? '💔' : mode === 'letter' ? '❤️' : '✉️'}
              </span>
              <div className="preview-info">
                <p>To: {m.recipient}</p>
                {openId === m.id && (
                  <div className="revealed-content">
                    <p><strong>From:</strong> {m.sender}</p>
                    <p className="msg-body">"{m.content}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;