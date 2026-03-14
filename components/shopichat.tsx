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
      content: "Hi! I'm **Shopi** 👋, your Shoplace assistant. I can help you find shops, understand how the platform works, or answer any questions about buying and selling in Kenya. What can I help you with?",
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
      setTimeout(() => inputRef.current?.focus(), 100);
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
      const reply = data.reply || "Sorry, I couldn't get a response. Please try again.";
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
        <div className="shopi-panel">
          <div className="shopi-header">
            <div className="shopi-header-left">
              <div className="shopi-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white" opacity="0.2"/>
                  <path d="M8 12C8 9.8 9.8 8 12 8s4 1.8 4 4-1.8 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="shopi-name">Shopi</div>
                <div className="shopi-status">
                  <span className="shopi-dot" />
                  Shoplace AI · Always online
                </div>
              </div>
            </div>
            <button className="shopi-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="shopi-messages">
            {messages.map((m, i) => (
              <div key={i} className={"shopi-msg " + (m.role === "user" ? "shopi-msg-user" : "shopi-msg-bot")}>
                {m.role === "assistant" && (
                  <div className="shopi-msg-av">S</div>
                )}
                <div
                  className="shopi-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="shopi-msg shopi-msg-bot">
                <div className="shopi-msg-av">S</div>
                <div className="shopi-bubble shopi-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* SUGGESTIONS — only show on first message */}
          {messages.length === 1 && !loading && (
            <div className="shopi-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="shopi-suggestion" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="shopi-input-row">
            <input
              ref={inputRef}
              className="shopi-input"
              placeholder="Ask me anything about Shoplace..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              className="shopi-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="shopi-footer">Powered by DeepSeek AI · Shoplace Kenya</div>
        </div>
      )}

      {/* FAB BUTTON */}
      <button className="shopi-fab" onClick={() => setOpen(o => !o)} title="Chat with Shopi">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="shopi-badge">{unread}</span>}
      </button>
    </>
  );
}

const css = `
/* FAB — desktop: bottom-right, mobile: above bottom nav */
.shopi-fab{
  position:fixed;
  bottom:2rem;
  right:2rem;
  width:56px;height:56px;
  border-radius:50%;
  background:linear-gradient(135deg,#c84b31,#e8721a,#f5a623);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 24px rgba(200,75,49,0.4);
  z-index:9999;
  transition:all .25s;
}
.shopi-fab:hover{transform:scale(1.08);box-shadow:0 12px 32px rgba(200,75,49,0.5);}
.shopi-badge{
  position:absolute;top:-4px;right:-4px;
  width:20px;height:20px;
  background:#ff3b30;border-radius:50%;
  color:white;font-size:0.65rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  border:2px solid white;
}

/* PANEL — desktop */
.shopi-panel{
  position:fixed;
  bottom:6.5rem;
  right:2rem;
  width:370px;
  height:520px;
  background:white;
  border-radius:20px;
  box-shadow:0 24px 64px rgba(0,0,0,0.18);
  display:flex;flex-direction:column;
  z-index:9998;
  overflow:hidden;
  animation:shopiSlideUp .25s ease;
}
@keyframes shopiSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

.shopi-header{
  background:linear-gradient(135deg,#c84b31,#e8721a);
  padding:1rem 1.2rem;
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.shopi-header-left{display:flex;align-items:center;gap:0.75rem;}
.shopi-avatar{
  width:38px;height:38px;border-radius:50%;
  background:rgba(255,255,255,0.2);
  display:flex;align-items:center;justify-content:center;
  border:2px solid rgba(255,255,255,0.3);
}
.shopi-name{font-family:'Syne',sans-serif;font-weight:800;font-size:0.95rem;color:white;}
.shopi-status{display:flex;align-items:center;gap:0.35rem;font-size:0.68rem;color:rgba(255,255,255,0.75);}
.shopi-dot{width:6px;height:6px;background:#4ade80;border-radius:50%;flex-shrink:0;}
.shopi-close{
  background:rgba(255,255,255,0.15);border:none;color:white;
  width:28px;height:28px;border-radius:50%;cursor:pointer;
  font-size:0.85rem;display:flex;align-items:center;justify-content:center;
  transition:background .2s;
}
.shopi-close:hover{background:rgba(255,255,255,0.28);}

.shopi-messages{
  flex:1;overflow-y:auto;padding:1rem;
  display:flex;flex-direction:column;gap:0.75rem;
  scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.1) transparent;
}
.shopi-msg{display:flex;align-items:flex-end;gap:0.5rem;}
.shopi-msg-user{flex-direction:row-reverse;}
.shopi-msg-av{
  width:26px;height:26px;border-radius:50%;
  background:linear-gradient(135deg,#c84b31,#e8721a);
  color:white;font-size:0.65rem;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;font-family:'Syne',sans-serif;
}
.shopi-bubble{
  padding:0.6rem 0.85rem;border-radius:14px;
  font-size:0.82rem;line-height:1.55;
  max-width:270px;word-break:break-word;
}
.shopi-msg-bot .shopi-bubble{background:#f5f0e8;color:#0d0d0d;border-bottom-left-radius:4px;}
.shopi-msg-user .shopi-bubble{background:linear-gradient(135deg,#c84b31,#e8721a);color:white;border-bottom-right-radius:4px;}
.shopi-typing{display:flex;align-items:center;gap:4px;padding:0.75rem 1rem;}
.shopi-typing span{width:7px;height:7px;background:rgba(13,13,13,0.3);border-radius:50%;animation:shopiDot 1.2s infinite;}
.shopi-typing span:nth-child(2){animation-delay:.2s;}
.shopi-typing span:nth-child(3){animation-delay:.4s;}
@keyframes shopiDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

.shopi-suggestions{padding:0 1rem 0.75rem;display:flex;flex-wrap:wrap;gap:0.4rem;}
.shopi-suggestion{
  padding:0.3rem 0.7rem;
  border:1.5px solid rgba(200,75,49,0.25);border-radius:100px;
  font-size:0.72rem;font-weight:500;color:#c84b31;
  background:rgba(200,75,49,0.04);cursor:pointer;transition:all .2s;
  font-family:'DM Sans',sans-serif;
}
.shopi-suggestion:hover{background:rgba(200,75,49,0.08);border-color:rgba(200,75,49,0.5);}

.shopi-input-row{
  display:flex;gap:0.5rem;
  padding:0.75rem 1rem;
  border-top:1px solid rgba(13,13,13,0.08);
  flex-shrink:0;
}
.shopi-input{
  flex:1;border:1.5px solid rgba(13,13,13,0.1);border-radius:10px;
  padding:0.55rem 0.8rem;
  font-family:'DM Sans',sans-serif;font-size:0.82rem;
  outline:none;color:#0d0d0d;background:white;
}
.shopi-input:focus{border-color:#e8721a;}
.shopi-input::placeholder{color:rgba(13,13,13,0.35);}
.shopi-input:disabled{opacity:0.6;}
.shopi-send{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,#c84b31,#e8721a);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s;flex-shrink:0;
}
.shopi-send:hover{opacity:0.85;}
.shopi-send:disabled{opacity:0.4;cursor:not-allowed;}
.shopi-footer{
  text-align:center;font-size:0.62rem;color:rgba(13,13,13,0.3);
  padding:0.5rem;border-top:1px solid rgba(13,13,13,0.05);flex-shrink:0;
}

/* MOBILE — above bottom nav (70px), panel fills most of screen */
@media(max-width:768px){
  .shopi-fab{
    bottom:80px;
    right:1rem;
    width:52px;height:52px;
    z-index:9999;
  }
  .shopi-panel{
    position:fixed;
    bottom:144px;
    right:0.75rem;
    left:0.75rem;
    width:auto;
    height:65vh;
    max-height:500px;
    border-radius:18px;
    z-index:9998;
  }
}
@media(max-width:380px){
  .shopi-panel{
    bottom:140px;
    height:60vh;
  }
}
`;