import React, { useState, useEffect } from 'react';


function AIChatDropdown({ onInsertAIResponse, buttonStyle, chapters, characterList, synopsis, instructions, pendingAIPrompt, setPendingAIPrompt }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingContext, setPendingContext] = useState(null); // Holds scene beat or highlighted text

  // Compose full context for every prompt
  const getFullPrompt = (userPrompt) => {
    const allChars = (characterList && characterList.length > 0)
      ? `All story characters: ${characterList.map(c => c.name).join(', ')}.`
      : '';
    let contextBlock = `STORY CONTEXT:\n${synopsis}\nINSTRUCTIONS: ${instructions}\n${allChars}`;
    if (pendingContext) {
      contextBlock += `\n\n${pendingContext.type === 'highlight' ? 'HIGHLIGHTED TEXT:' : 'SCENE BEAT:'}\n${pendingContext.text}`;
    }
    return `${contextBlock}\n\nUSER INSTRUCTION: ${userPrompt}`;
  };

  // If a pendingAIPrompt is set (from a scene beat or highlight), store it in pendingContext and open the dropdown
  useEffect(() => {
    if (pendingAIPrompt) {
      setPendingContext(pendingAIPrompt);
      setPendingAIPrompt(null);
      setOpen(true);
    }
    // eslint-disable-next-line
  }, [pendingAIPrompt]);

  const handleSend = async () => {
    if (!input.trim() && !pendingContext) return;
    const promptToSend = getFullPrompt(input);
    const userMsg = { sender: 'user', text: promptToSend };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setPendingContext(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/mistral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend, stream: false }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'ai', text: data.response || data.result || 'No response.' }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Error contacting AI.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={buttonStyle || { padding: '0.5rem 1rem', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        f4ac Chat with AI
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', right: 0, width: 520, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 100, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: '0.5rem', fontSize: '0.98rem' }}>
            {messages.length === 0 && <div style={{ color: '#888' }}>Start a conversation...</div>}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', textAlign: msg.sender === 'user' ? 'right' : 'left', position: 'relative' }}>
                <span style={{ color: msg.sender === 'user' ? '#2563eb' : '#059669', fontWeight: 'bold' }}>{msg.sender === 'user' ? 'You' : 'AI'}:</span>
                <span style={{ marginLeft: 6 }}>{msg.text}</span>
                {msg.sender === 'ai' && onInsertAIResponse && (
                  <button
                    style={{ marginLeft: 10, fontSize: '0.95em', padding: '0.2em 0.7em', borderRadius: 4, border: '1px solid #059669', background: '#e0f7ef', color: '#059669', cursor: 'pointer', position: 'absolute', right: 0, top: 0 }}
                    onClick={() => onInsertAIResponse(msg.text)}
                  >
                    795 Add to Writer
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Show pending context if present */}
          {pendingContext && (
            <div style={{ background: '#f3f4f6', padding: '0.7rem', borderRadius: 5, marginBottom: 8, fontSize: '0.97rem', color: '#333' }}>
              <strong>{pendingContext.type === 'highlight' ? 'Highlighted Text' : 'Scene Beat'}:</strong>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{pendingContext.text}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              style={{ flex: 1, borderRadius: 4, border: '1px solid #ccc', padding: '0.5rem', fontSize: '1rem' }}
              placeholder={pendingContext ? "Type instructions for AI..." : "Ask the AI for help, ideas, or prose..."}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              style={{ padding: '0.5rem 1.2rem', borderRadius: 4, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              disabled={loading}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
  


export default AIChatDropdown;

