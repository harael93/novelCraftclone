import React, { useState, useEffect, useRef } from 'react';


function AIChatDropdown({ onInsertAIResponse, buttonStyle, chapters, characterList, synopsis, instructions, pendingAIPrompt, setPendingAIPrompt }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingContext, setPendingContext] = useState(null); // Holds scene beat or highlighted text

  // Ref for chat scroll
  const chatContainerRef = useRef(null);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

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
    let aiText = '';
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.12.197:8030/api/chat';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "mistral", prompt: promptToSend, stream: true}),
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      let decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      // Add a placeholder message for streaming
      setMessages(msgs => [...msgs, { sender: 'ai', text: '' }]);
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          // Ollama streams JSON lines, so split by newlines
          let lines = buffer.split('\n');
          buffer = lines.pop(); // last line may be incomplete
          for (let line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                aiText += json.response;
                setMessages(msgs => {
                  // Update the last AI message with the new text
                  const updated = [...msgs];
                  for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i].sender === 'ai') {
                      updated[i] = { ...updated[i], text: aiText };
                      break;
                    }
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete lines
            }
          }
        }
      }
      // If nothing streamed, show fallback
      if (!aiText) {
        setMessages(msgs => [...msgs, { sender: 'ai', text: 'No response.' }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Error contacting AI.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="ai-chat-dropdown-root">
      <button
        className="ai-chat-dropdown-button"
        onClick={() => setOpen(o => !o)}
      >
        Chat with AI
      </button>
      {open && (
        <div className="ai-chat-dropdown-panel">
          <div
            ref={chatContainerRef}
            style={{ maxHeight: 220, overflowY: 'auto', marginBottom: '0.5rem', fontSize: '0.98rem' }}
          >
            {messages.length === 0 && <div style={{ color: '#888' }}>Start a conversation...</div>}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', textAlign: msg.sender === 'user' ? 'right' : 'left', position: 'relative', paddingRight: msg.sender === 'ai' && onInsertAIResponse ? 120 : undefined }}>
                <span style={{ color: msg.sender === 'user' ? '#2563eb' : '#059669', fontWeight: 'bold' }}>{msg.sender === 'user' ? 'You' : 'AI'}:</span>
                <span style={{ marginLeft: 6 }}>{msg.text}</span>
                {msg.sender === 'ai' && onInsertAIResponse && (
                  <button
                    style={{
                      marginLeft: 10,
                      fontSize: '0.95em',
                      padding: '0.2em 0.7em',
                      borderRadius: 4,
                      border: '1px solid #059669',
                      background: '#e0f7ef',
                      color: '#059669',
                      cursor: 'pointer',
                      position: 'sticky',
                      right: 0,
                      top: 0,
                      zIndex: 20,
                      float: 'right',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                    }}
                    onClick={() => onInsertAIResponse(msg.text)}
                  >
                    ➤ Add to Writer
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
              disabled={loading || (!input.trim() && !pendingContext)}
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

