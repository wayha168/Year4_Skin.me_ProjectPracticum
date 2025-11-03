import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaPaperPlane, FaTimes, FaSpinner } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import axiosAuth from "../../api/axiosConfig";
import useAuthContext from "../../Authentication/AuthContext";
import "./MessageInput.css";
import "./MessageButton.css";

const WELCOME_MESSAGE =
  "Hello! This is Skin.me Assistant – your personal skincare advisor. How can I help you today?";

const BACKEND_URL = "https://backend.skinme.store";
const FRONTEND_URL = "https://skinme.store";

const FALLBACK_ANSWER =
  "I couldn't find an exact product for that, but I can still help you with skincare advice or product suggestions!";

const MessageWidget = () => {
  const [showInput, setShowInput] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showInput && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: WELCOME_MESSAGE,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [showInput, messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      role: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosAuth.post("/chat/assistant", trimmed, {
        headers: { "Content-Type": "text/plain" },
        timeout: 30_000,
      });

      let aiText = (res.data || "").trim();
      if (!aiText) aiText = FALLBACK_ANSWER;

      aiText = aiText.replace(/src="\/api\/v1\/images/g, `src="${BACKEND_URL}/api/v1/images`);
      // .replace(/href="\/products/g, `href="${FRONTEND_URL}/products`);

      const assistantMsg = {
        role: "assistant",
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      // Even if backend fails, provide fallback answer so conversation continues
      const errMsg = {
        role: "assistant",
        text: FALLBACK_ANSWER,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  if (!showInput) {
    return (
      <div className="message-button-wrapper" onClick={() => setShowInput(true)}>
        <i className="fa-solid fa-message" />
      </div>
    );
  }

  return (
    <div className="message-box">
      <div className="message-header">
        <span className="header-title">
          <span className="skinme-text-icon">S</span>
          Skin.me Assistant
        </span>
        <button onClick={() => setShowInput(false)} className="close-button">
          <FaTimes />
        </button>
      </div>

      <div className="message-list">
        {messages.map((msg, i) => (
          <div key={i} className={`message-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
            <div className="avatar">
              {msg.role === "user" ? (
                <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
              ) : (
                <div className="skinme-text-avatar">S</div>
              )}
            </div>
            <div className="bubble-content">
              <p className="message-text" dangerouslySetInnerHTML={{ __html: msg.text }} />
              <small className="message-time">{msg.time}</small>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-bubble assistant loading">
            <div className="avatar">
              <div className="skinme-text-avatar">S</div>
            </div>
            <div className="bubble-content">
              <FaSpinner className="spinner" />
              <span>Answer…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <button onClick={() => setShowEmoji(!showEmoji)} className="emoji-button" disabled={loading}>
          <FaSmile />
        </button>

        {showEmoji && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
          </div>
        )}

        <input
          type="text"
          className="message-input"
          placeholder="Ask about products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />

        <button onClick={handleSend} className="send-button" disabled={loading || !input.trim()}>
          {loading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
};

export default MessageWidget;
