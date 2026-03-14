"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I find a shop?",
  "How do I sell on Shoplace?",
  "What is a Verified Seller?",
  "How do I save a product?",
];

export default function ShopiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am **Shopi** your Shoplace assistant. I can help you find shops, understand how the platform works, or answer any questions about buying and selling in Kenya. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I could not get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your internet and try again." }]);
    }
    setLoading(false);
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      <style>{css}</style>

      {/* CHAT PANEL */}
      {open && (
        <div className="sp-panel">
          {/* HEADER */}
          <div className="sp-header">
            <div className="sp-header-left">
              <div className="sp-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="sp-name">Shopi</div>
                <div className="sp-status">
                  <span className="sp-dot"></span>
                  Shoplace AI
                </div>
              </div>
            </div>
            <button className="sp-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div className="sp-messages">
            {messages.map((m, i) => (
              <div key={i} className={"sp-msg " + (m.role === "user" ? "sp-msg-user" : "sp-msg-bot")}>
                {m.role === "assistant" && <div className="sp-msg-av">S</div>}
                <div className="sp-bubble" dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }} />
              </div>
            ))}
            {loading && (
              <div className="sp-msg sp-msg-bot">
                <div className="sp-msg-av">S</div>
                <div className="sp-bubble sp-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* SUGGESTIONS */}
          {messages.length === 1 && !loading && (
            <div className="sp-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="sp-suggestion" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="sp-input-row">
            <input
              ref={inputRef}
              className="sp-input"
              placeholder="Ask anything about Shoplace..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              autoComplete="off"
            />
            <button
              className="sp-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button className="sp-fab" onClick={() => setOpen(o => !o)} title="Chat with Shopi">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="sp-badge">{unread}</span>}
      </button>
    </>
  );
}

const css = `
/* ── FLOATING BUTTON ── */
.sp-fab {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c84b31, #e8721a, #f5a623);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(200,75,49,0.45);
  z-index: 99999;
  transition: transform 0.25s, box-shadow 0.25s;
}
.sp-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(200,75,49,0.55);
}
.sp-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ff3b30;
  border-radius: 50%;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* ── CHAT PANEL ── */
.sp-panel {
  position: fixed;
  bottom: 6.5rem;
  left: 2rem;
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  z-index: 99998;
  overflow: hidden;
  animation: spSlideUp 0.25s ease;
}
@keyframes spSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── HEADER ── */
.sp-header {
  background: linear-gradient(135deg, #c84b31, #e8721a);
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.sp-header-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.sp-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sp-name {
  font-weight: 800;
  font-size: 0.92rem;
  color: white;
  letter-spacing: -0.01em;
}
.sp-status {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.66rem;
  color: rgba(255,255,255,0.75);
  margin-top: 0.1rem;
}
.sp-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  flex-shrink: 0;
}
.sp-close {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.sp-close:hover { background: rgba(255,255,255,0.28); }

/* ── MESSAGES ── */
.sp-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.08) transparent;
}
.sp-msg {
  display: flex;
  align-items: flex-end;
  gap: 0.45rem;
}
.sp-msg-user { flex-direction: row-reverse; }
.sp-msg-av {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c84b31, #e8721a);
  color: white;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sp-bubble {
  padding: 0.55rem 0.8rem;
  border-radius: 14px;
  font-size: 0.81rem;
  line-height: 1.55;
  max-width: 260px;
  word-break: break-word;
}
.sp-msg-bot .sp-bubble {
  background: #f5f0e8;
  color: #0d0d0d;
  border-bottom-left-radius: 4px;
}
.sp-msg-user .sp-bubble {
  background: linear-gradient(135deg, #c84b31, #e8721a);
  color: white;
  border-bottom-right-radius: 4px;
}
.sp-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.7rem 0.9rem;
}
.sp-typing span {
  width: 6px;
  height: 6px;
  background: rgba(13,13,13,0.25);
  border-radius: 50%;
  animation: spDot 1.2s infinite;
}
.sp-typing span:nth-child(2) { animation-delay: 0.2s; }
.sp-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes spDot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}

/* ── SUGGESTIONS ── */
.sp-suggestions {
  padding: 0 0.9rem 0.7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  flex-shrink: 0;
}
.sp-suggestion {
  padding: 0.28rem 0.65rem;
  border: 1.5px solid rgba(200,75,49,0.25);
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #c84b31;
  background: rgba(200,75,49,0.04);
  cursor: pointer;
  transition: all 0.2s;
}
.sp-suggestion:hover {
  background: rgba(200,75,49,0.1);
  border-color: rgba(200,75,49,0.5);
}

/* ── INPUT ── */
.sp-input-row {
  display: flex;
  gap: 0.45rem;
  padding: 0.7rem 0.9rem;
  border-top: 1px solid rgba(13,13,13,0.08);
  flex-shrink: 0;
  background: white;
}
.sp-input {
  flex: 1;
  border: 1.5px solid rgba(13,13,13,0.12);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  color: #0d0d0d;
  background: white;
  -webkit-appearance: none;
}
.sp-input:focus { border-color: #e8721a; }
.sp-input::placeholder { color: rgba(13,13,13,0.35); }
.sp-input:disabled { opacity: 0.6; }
.sp-send {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #c84b31, #e8721a);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.sp-send:hover { opacity: 0.85; }
.sp-send:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .sp-fab {
    bottom: 80px;
    left: 1rem;
    width: 50px;
    height: 50px;
  }
  .sp-panel {
    bottom: 148px;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    height: 62vh;
    max-height: 460px;
  }
}
`;