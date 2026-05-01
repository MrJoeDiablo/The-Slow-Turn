import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

const socket = io();

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off('message');
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      socket.emit('message', { text: input });
      setInput('');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>← Back</Link>
      
      <h2>Team Chat</h2>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        height: '400px',
        padding: '12px',
        marginBottom: '12px',
        overflowY: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999' }}>No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '2px' }}>
              <small style={{ color: '#666' }}>{msg.timestamp}</small>
              <p style={{ margin: '4px 0' }}>{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
