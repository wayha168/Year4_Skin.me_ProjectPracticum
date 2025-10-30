import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaPaperPlane, FaTimes, FaSpinner } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import axiosAuth from "../../api/axiosConfig";
import useAuthContext from "../../Authentication/AuthContext";
import "./MessageInput.css";
import "./MessageButton.css";

const WELCOME_MESSAGE =
  "Hello! This is **SkinMe Assistant** – your personal skincare advisor. How can I help you today?";

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
      const welcome = {
        role: "assistant",
        text: WELCOME_MESSAGE,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcome]);
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

      const aiText = (res.data || "").trim() || "I couldn't find a matching product.";

      const assistantMsg = {
        role: "assistant",
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorText =
        err.response?.data || err.message || "Sorry, I'm having trouble connecting. Please try again.";
      const errMsg = {
        role: "assistant",
        text: errorText,
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

  // Floating button
  if (!showInput) {
    return (
      <div
        className="message-button-wrapper"
        onClick={() => setShowInput(true)}
        style={{ cursor: "pointer" }}
      >
        <i className="fa-solid fa-message" />
      </div>
    );
  }

  // Full chat UI
  return (
    <div className="message-box">
      {/* Header */}
      <div className="message-header">
        <span className="header-title">
          <span className="skinme-text-icon">S</span>
          SkinMe Assistant
        </span>
        <button onClick={() => setShowInput(false)} className="close-button">
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="message-list">
        {messages.map((msg, i) => (
          <div key={i} className={`message-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
            {/* Avatar */}
            <div className="avatar">
              {msg.role === "user" ? (
                <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
              ) : (
                <div className="skinme-text-avatar">S</div>
              )}
            </div>

            {/* Text */}
            <div className="bubble-content">
              <p className="message-text" dangerouslySetInnerHTML={{ __html: msg.text }} />
              <small className="message-time">{msg.time}</small>
            </div>
          </div>
        ))}

        {/* Loading */}
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

      {/* Input */}
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
