"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import useAuthContext from "../../app/lib/Authentication/AuthContext";
import { FaArrowUp, FaEdit, FaHeadset, FaImage, FaPaperclip, FaPlus, FaRobot, FaSpinner, FaTrashAlt, FaUser } from "react-icons/fa";
import { FaWandSparkles } from "react-icons/fa6";
import { CHATBOT_API_BASE, CHATBOT_WS_BASE } from "../../app/lib/api/config";

const WELCOME_MESSAGE =
  "Hello! I’m Skin.me Assistant. I can help with skincare questions, product guidance, and skin image analysis.";

const ADMIN_WELCOME_MESSAGE =
  "You’re connected to Skin.me Support. Send a message and our team will reply here. You can switch back to AI Assistant anytime.";

const ERROR_MESSAGE = "Sorry, I couldn't respond just now. Please try again in a moment and I’ll help you.";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const CHAT_MODE_AI = "ai";
const CHAT_MODE_ADMIN = "admin";

function storageKeyForUser(userId) {
  return `chatHistory_${userId}`;
}

function formatClock(dateLike) {
  const date = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function titleFromMessages(messages = [], fallback = "New Chat") {
  const firstUser = messages.find((m) => m.role === "user" && m.text?.trim());
  if (!firstUser) return fallback;
  return firstUser.text.trim().slice(0, 30);
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(url = "") {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

function findImageUrlsInText(text = "") {
  // Don't extract product URLs as images
  const productUrlPattern = /https?:\/\/skinme\.store\/product_details\?productId=\d+/gi;
  const productUrls = text.match(productUrlPattern) || [];
  
  const directMatches = text.match(/https?:\/\/[^\s<>"']+\.(?:png|jpg|jpeg|gif|webp|bmp|svg)/gi) || [];
  const htmlMatches = [...text.matchAll(/src=["']([^"']+)["']/gi)].map((match) => match[1]);
  
  // Markdown images but exclude product URLs
  const markdownMatches = [...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/gi)]
    .map((match) => match[1])
    .filter(url => !productUrls.includes(url));
  
  return [...new Set([...directMatches, ...htmlMatches, ...markdownMatches].map(normalizeUrl))];
}

function stripImageMarkup(text = "") {
  return text
    .replace(/<img[^>]*>/gi, "")
    .replace(/!\[[^\]]*]\(([^)]+)\)/gi, "")
    .trim();
}

function formatAssistantHtml(text) {
  let escaped = escapeHtml(text);

  // Process lines with product URLs followed by product name and price
  // Format: "https://skinme.store/product_details?productId=17 — Product Name — Price"
  const lines = escaped.split("\n");
  const processedLines = lines.map((line) => {
    // Match: product URL followed by em-dash/dash and product info
    const match = line.match(/(https?:\/\/skinme\.store\/product_details\?productId=(\d+))\s*[—-]\s*(.+)$/i);
    if (match) {
      const fullUrl = match[1];
      const productId = match[2];
      const productInfo = match[3].trim();
      return `<div class="border-b border-[#f0d7e3] py-2 last:border-0"><a href="/product_details?productId=${productId}" class="block font-semibold text-[#1f2937] hover:text-[#b5487f]">${productInfo}</a></div>`;
    }
    return line;
  });
  
  // Convert other markdown links [text](url) to HTML anchors
  let result = processedLines.join("\n").replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-[#b5487f] underline break-all">$1</a>'
  );

  // Convert other plain URLs to clickable links (non-product URLs)
  result = result.replace(
    /(https?:\/\/(?!skinme\.store\/product_details)[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noreferrer" class="text-[#b5487f] underline break-all">$1</a>'
  );

  return result.replace(/\n/g, "<br />");
}

function extractImages(payload) {
  if (!payload || typeof payload !== "object") return [];

  const imageCandidates = [
    payload.image,
    payload.imageUrl,
    payload.image_url,
    payload.qrImage,
    payload.data?.image,
    payload.data?.imageUrl,
    payload.data?.image_url,
  ];

  const arrayCandidates = [
    payload.images,
    payload.imageUrls,
    payload.image_urls,
    payload.data?.images,
    payload.data?.imageUrls,
    payload.data?.image_urls,
  ];

  const resolved = [];

  imageCandidates.forEach((value) => {
    if (typeof value === "string" && value.trim()) resolved.push(normalizeUrl(value.trim()));
  });

  arrayCandidates.forEach((value) => {
    if (!Array.isArray(value)) return;
    value.forEach((item) => {
      if (typeof item === "string" && item.trim()) {
        resolved.push(normalizeUrl(item.trim()));
      } else if (item && typeof item === "object") {
        const nestedUrl = item.url ?? item.image ?? item.imageUrl ?? item.src;
        if (typeof nestedUrl === "string" && nestedUrl.trim()) {
          resolved.push(normalizeUrl(nestedUrl.trim()));
        }
      }
    });
  });

  return [...new Set(resolved)];
}

function extractReply(payload) {
  // API returns: { reply, options, session_id, admin_connected }
  if (typeof payload === "string") {
    return {
      text: stripImageMarkup(payload.trim()),
      images: [],
      productIds: [],
      options: [],
    };
  }

  if (!payload || typeof payload !== "object") {
    return { text: "", images: [], productIds: [], options: [] };
  }

  let rawText = payload.reply || payload.message || payload.answer || payload.response || "";

  if (typeof rawText !== "string") {
    rawText = "";
  }

  const text = stripImageMarkup(rawText.trim());
  
  // Extract productIds and match them with images if available from API
  const productIds = payload.productIds && Array.isArray(payload.productIds) 
    ? payload.productIds 
    : [...rawText.matchAll(/productId=(\d+)/gi)].map(m => m[1]);
  
  // Extract images - check payload for image fields that might have product context
  let images = [...new Set([...extractImages(payload), ...findImageUrlsInText(rawText)])];
  
  const options = Array.isArray(payload.options) ? payload.options : [];

  return { text, images, productIds, options };
}

function createWelcomeChat(mode = CHAT_MODE_AI) {
  const text = mode === CHAT_MODE_ADMIN ? ADMIN_WELCOME_MESSAGE : WELCOME_MESSAGE;
  return {
    id: `${mode}-${Date.now()}`,
    title: mode === CHAT_MODE_ADMIN ? "Support chat" : "New Chat",
    mode,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        sender: mode === CHAT_MODE_ADMIN ? "admin" : "ai",
        text,
        html: formatAssistantHtml(text),
        images: [],
        productIds: [],
        options: [],
        time: formatClock(),
      },
    ],
  };
}

function mapBackendMessage(msg, index = 0) {
  const content = typeof msg?.content === "string" ? msg.content : String(msg?.content || "");
  const roleRaw = String(msg?.role || "").toLowerCase();
  const senderRaw = String(msg?.sender || "").toLowerCase();
  const isUser = roleRaw === "user" || senderRaw === "user";
  const isAdmin =
    senderRaw === "admin" ||
    roleRaw === "admin" ||
    (roleRaw === "assistant" && msg?.is_ai_response === false);

  return {
    id: `hist-${index}-${msg?.created_at || Date.now()}`,
    role: isUser ? "user" : "assistant",
    sender: isUser ? "user" : isAdmin ? "admin" : "ai",
    text: content,
    html: formatAssistantHtml(content),
    images: [],
    productIds: [...content.matchAll(/productId=(\d+)/gi)].map((m) => m[1]),
    options: [],
    time: formatClock(msg?.created_at),
  };
}

export default function ChatAssistantPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/chatbot");
    }
  }, [user, authLoading, router]);

  const composerInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);
  const wsRef = useRef(null);
  const chatsRef = useRef([]);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatMode, setChatMode] = useState(CHAT_MODE_AI);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adminConnected, setAdminConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState("idle");

  const currentChat = chats.find((c) => c.id === currentChatId);
  const messages = currentChat?.messages || [];
  const activeMode = currentChat?.mode || chatMode;
  const isAdminMode = activeMode === CHAT_MODE_ADMIN;

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const getUserDisplayName = useCallback(() => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return user?.name || user?.email || "";
  }, [user]);

  const persistChatsForUser = useCallback(
    (nextChats) => {
      if (!user?.id || typeof window === "undefined") return;
      try {
        const toSave = (nextChats || []).filter((chat) =>
          chat.messages?.some((m) => m.role === "user"),
        );
        localStorage.setItem(storageKeyForUser(user.id), JSON.stringify(toSave));
      } catch (err) {
        console.error("Failed to persist chat history:", err);
      }
    },
    [user?.id],
  );

  const saveChatToBackend = useCallback(
    async (chatToSave, allChats = null) => {
      if (!user?.id || !chatToSave) return;
      const hasUserMessage = chatToSave.messages?.some((m) => m.role === "user");
      if (!hasUserMessage) return;

      const source = allChats || chatsRef.current;
      const next = [...source];
      const idx = next.findIndex((c) => c.id === chatToSave.id);
      if (idx >= 0) next[idx] = chatToSave;
      else next.unshift(chatToSave);
      persistChatsForUser(next);

      // Best-effort backend log of latest turn (non-blocking)
      try {
        const userMsgs = chatToSave.messages.filter((m) => m.role === "user");
        const assistantMsgs = chatToSave.messages.filter((m) => m.role === "assistant" && m.id !== "welcome");
        const lastUser = userMsgs[userMsgs.length - 1];
        const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
        if (!lastUser) return;

        await axios.post(
          `${CHATBOT_API_BASE}/v1/chat/log`,
          {
            session_id: String(chatToSave.id),
            message: lastUser.text || "",
            reply: lastAssistant?.text || "",
            user_id: String(user.id),
            user_email: user.email || null,
            user_name: getUserDisplayName() || null,
            timestamp: new Date().toISOString(),
          },
          { headers: { "Content-Type": "application/json" }, timeout: 5000 },
        );
      } catch {
        // local history is enough if log endpoint fails
      }
    },
    [user, persistChatsForUser, getUserDisplayName],
  );

  const loadSessionHistory = useCallback(async (sessionId) => {
    if (!sessionId) return null;
    try {
      const res = await axios.get(`${CHATBOT_API_BASE}/v1/chat/sessions/${sessionId}/history`, {
        params: { limit: 200 },
        timeout: 10000,
      });
      const list = Array.isArray(res?.data?.messages) ? res.data.messages : [];
      if (!list.length) return null;
      return list.map((msg, index) => mapBackendMessage(msg, index));
    } catch {
      return null;
    }
  }, []);

  // Load chat history for this user_id (local + hydrate from backend when possible)
  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;
    let cancelled = false;

    const load = async () => {
      setHistoryLoaded(false);
      let localChats = [];
      try {
        const stored = localStorage.getItem(storageKeyForUser(user.id));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localChats = parsed.map((chat) => ({
              ...chat,
              mode: chat.mode === CHAT_MODE_ADMIN ? CHAT_MODE_ADMIN : CHAT_MODE_AI,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }

      // Hydrate each known session from backend history (keyed by session/user)
      const hydrated = await Promise.all(
        localChats.map(async (chat) => {
          const remoteMessages = await loadSessionHistory(chat.id);
          if (!remoteMessages?.length) return chat;
          return {
            ...chat,
            messages: remoteMessages,
            title: chat.title && chat.title !== "New Chat" ? chat.title : titleFromMessages(remoteMessages, chat.title),
          };
        }),
      );

      if (cancelled) return;

      if (hydrated.length > 0) {
        setChats(hydrated);
        setCurrentChatId(hydrated[0].id);
        setChatMode(hydrated[0].mode || CHAT_MODE_AI);
        persistChatsForUser(hydrated);
      } else {
        const welcome = createWelcomeChat(CHAT_MODE_AI);
        setChats([welcome]);
        setCurrentChatId(welcome.id);
        setChatMode(CHAT_MODE_AI);
      }
      setHistoryLoaded(true);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loadSessionHistory, persistChatsForUser]);

  // Keep localStorage in sync whenever chats change for this user
  useEffect(() => {
    if (!historyLoaded || !user?.id) return;
    persistChatsForUser(chats);
  }, [chats, historyLoaded, user?.id, persistChatsForUser]);

  // Live admin WebSocket for current session
  useEffect(() => {
    if (!currentChatId || !isAdminMode) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus("idle");
      setAdminConnected(false);
      return undefined;
    }

    const wsUrl = `${CHATBOT_WS_BASE}/v1/ws/chat/${encodeURIComponent(currentChatId)}?role=user`;
    setWsStatus("connecting");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => {
      setWsStatus("disconnected");
      setAdminConnected(false);
    };
    ws.onerror = () => setWsStatus("error");
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const type = String(payload?.type || payload?.event || "").toLowerCase();
        const role = String(payload?.role || payload?.sender || "").toLowerCase();
        const content =
          payload?.content || payload?.message || payload?.reply || payload?.text || "";

        if (type.includes("admin") && (type.includes("connect") || type.includes("join") || type.includes("online"))) {
          setAdminConnected(true);
        }
        if (type.includes("admin") && (type.includes("disconnect") || type.includes("leave") || type.includes("offline"))) {
          setAdminConnected(false);
        }
        if (typeof payload?.admin_connected === "boolean") {
          setAdminConnected(payload.admin_connected);
        }

        const looksLikeAdminMessage =
          role === "admin" ||
          type === "admin_reply" ||
          type === "admin-message" ||
          (type === "message" && role !== "user" && role !== "ai");

        if (!looksLikeAdminMessage || !content) return;

        const adminMessage = {
          id: `admin-${Date.now()}`,
          role: "assistant",
          sender: "admin",
          text: String(content),
          html: formatAssistantHtml(String(content)),
          images: [],
          productIds: [],
          options: [],
          time: formatClock(payload?.created_at),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, adminMessage] }
              : chat,
          ),
        );
        setLoading(false);
      } catch {
        // ignore non-JSON frames
      }
    };

    return () => {
      ws.close();
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [currentChatId, isAdminMode]);

  const createNewChat = async (mode = activeMode) => {
    if (currentChat) await saveChatToBackend(currentChat);
    const newChat = createWelcomeChat(mode);
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setChatMode(mode);
    setInput("");
    setSelectedImage(null);
    setAdminConnected(false);
  };

  const switchChatMode = async (mode) => {
    if (mode === activeMode) return;
    if (currentChat) await saveChatToBackend(currentChat);

    const existing = chats.find((c) => c.mode === mode);
    if (existing) {
      setCurrentChatId(existing.id);
      setChatMode(mode);
      setInput("");
      setSelectedImage(null);
      return;
    }
    await createNewChat(mode);
  };

  const switchChat = async (chatId) => {
    if (currentChatId !== chatId && currentChat) {
      await saveChatToBackend(currentChat);
    }
    const next = chats.find((c) => c.id === chatId);
    setCurrentChatId(chatId);
    if (next?.mode) setChatMode(next.mode);
    setInput("");
    setSelectedImage(null);
  };

  const deleteChat = (chatId) => {
    if (chats.length === 1) return;
    const newChats = chats.filter((c) => c.id !== chatId);
    setChats(newChats);
    persistChatsForUser(newChats);
    if (currentChatId === chatId) {
      setCurrentChatId(newChats[0].id);
      setChatMode(newChats[0].mode || CHAT_MODE_AI);
    }
  };

  const startRenaming = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveRename = async () => {
    if (!editingChatId) return;
    const newTitle = editingTitle.trim() || "Untitled Chat";
    const updated = chats.map((chat) => (chat.id === editingChatId ? { ...chat, title: newTitle } : chat));
    setChats(updated);
    const chatToUpdate = updated.find((c) => c.id === editingChatId);
    if (chatToUpdate) await saveChatToBackend(chatToUpdate, updated);
    setEditingChatId(null);
    setEditingTitle("");
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const selectedImagePreview = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, selectedImagePreview]);

  useEffect(() => {
    return () => {
      if (currentChat && user?.id) {
        saveChatToBackend(currentChat);
      }
    };
  }, [currentChat, user, saveChatToBackend]);

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image is too large. Please choose one under 10MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const sendText = async (message) => {
    if (!message?.trim()) throw new Error("Message cannot be empty");

    const body = {
      message: message.trim(),
      session_id: currentChatId || undefined,
      user_id: user?.id != null ? String(user.id) : undefined,
      user_email: user?.email || undefined,
      user_name: getUserDisplayName() || undefined,
      use_database: true,
    };

    const history = messages
      .filter((m) => m.role !== "assistant" || m.id !== "welcome")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }))
      .slice(-20);
    if (history.length > 0) body.history = history;

    const response = await axios.post(`${CHATBOT_API_BASE}/v1/chat`, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    if (typeof response?.data?.admin_connected === "boolean") {
      setAdminConnected(response.data.admin_connected);
    }

    return extractReply(response.data);
  };

  const sendImage = async (message, imageFile) => {
    if (!imageFile) throw new Error("Image file is required");

    const formData = new FormData();
    formData.append("message", (message || "").trim());
    if (currentChatId) formData.append("session_id", currentChatId);
    if (user?.id != null) formData.append("user_id", String(user.id));
    if (user?.email) formData.append("user_email", user.email);
    const name = getUserDisplayName();
    if (name) formData.append("user_name", name);
    formData.append("image", imageFile);
    formData.append("use_database", "true");

    const response = await axios.post(`${CHATBOT_API_BASE}/v1/chat/with-image`, formData, {
      timeout: 45000,
    });
    return extractReply(response.data);
  };

  const sendAdminMessage = async (message) => {
    const trimmed = message.trim();
    if (!trimmed) throw new Error("Message cannot be empty");

    // Persist user turn via chat API (also notifies backend session)
    const body = {
      message: trimmed,
      session_id: currentChatId || undefined,
      user_id: user?.id != null ? String(user.id) : undefined,
      user_email: user?.email || undefined,
      user_name: getUserDisplayName() || undefined,
      use_llm: false,
      use_database: false,
    };

    const response = await axios.post(`${CHATBOT_API_BASE}/v1/chat`, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    if (typeof response?.data?.admin_connected === "boolean") {
      setAdminConnected(response.data.admin_connected);
    }

    // Also push over websocket when connected (live admin inbox)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "user_message",
          role: "user",
          sender: "user",
          content: trimmed,
          session_id: currentChatId,
          user_id: user?.id != null ? String(user.id) : undefined,
        }),
      );
    }

    return response.data;
  };

  const handleSend = async (presetText) => {
    const trimmed = (presetText ?? input).trim();
    if ((!trimmed && !selectedImage) || loading) return;

    if (isAdminMode && selectedImage) {
      alert("Image upload is available in AI Assistant mode. Please switch back to AI to analyze images.");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      sender: "user",
      text: trimmed || "Please analyze this image.",
      time: formatClock(),
      localImage: selectedImagePreview,
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat" || chat.title === "Support chat"
                  ? (trimmed || "Image analysis").slice(0, 30)
                  : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat,
      ),
    );

    setInput("");
    setLoading(true);

    const imageToSend = selectedImage;
    clearSelectedImage();

    try {
      if (isAdminMode) {
        await sendAdminMessage(trimmed);
        // Keep loading until admin replies over WS (or timeout)
        setTimeout(() => setLoading(false), 1200);
        return;
      }

      const result = imageToSend
        ? await sendImage(trimmed || "Please analyze this skin image.", imageToSend)
        : await sendText(trimmed);

      const responseText = result.text || ERROR_MESSAGE;
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        sender: "ai",
        text: responseText,
        html: formatAssistantHtml(responseText),
        images: result.images || [],
        productIds: result.productIds || [],
        options: result.options || [],
        time: formatClock(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat,
        ),
      );
    } catch (error) {
      console.error("Chat assistant error:", error);
      if (error?.response?.data) console.error("❌ API Response:", error.response.data);

      const rawError =
        error?.response?.data?.message || error?.response?.data?.detail || error?.message || "";
      const rawErrorStr = Array.isArray(rawError)
        ? rawError.map((e) => (typeof e === "string" ? e : e?.msg || JSON.stringify(e))).join(", ")
        : typeof rawError === "string"
          ? rawError
          : "";
      let displayError = rawErrorStr || ERROR_MESSAGE;

      if (
        rawErrorStr.toLowerCase().includes("does not support image") ||
        rawErrorStr.toLowerCase().includes("image input")
      ) {
        displayError =
          "Sorry, the current AI model doesn't support image analysis right now. Please try asking a text question instead.";
      }

      const errorMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        sender: isAdminMode ? "admin" : "ai",
        text: displayError,
        html: formatAssistantHtml(displayError),
        images: [],
        productIds: [],
        time: formatClock(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat,
        ),
      );
    } finally {
      if (!isAdminMode) setLoading(false);
      composerInputRef.current?.focus();
    }
  };

  if (authLoading || !historyLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#6b7280]">
        <FaSpinner className="mr-2 animate-spin text-[#eb61a2]" />
        Loading your chat history...
      </div>
    );
  }

  const modeLabel = isAdminMode ? "Admin Support" : "AI Assistant";
  const filteredHistory = chats.filter((c) => (c.mode || CHAT_MODE_AI) === activeMode);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#fff8fb_0%,#fff4ef_45%,#f8f5f7_100%)] lg:flex-row">
      <aside className="min-h-0 shrink-0 overflow-y-auto overscroll-contain border-b border-[#f1d9e5] bg-[linear-gradient(180deg,#fff6fa_0%,#fffaf7_100%)] px-5 py-4 lg:flex lg:w-[280px] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:py-6 max-lg:max-h-[min(32dvh,280px)]">
        <div className="rounded-[28px] border border-[#f0d7e3] bg-white/85 p-5 shadow-[0_16px_32px_rgba(83,33,58,0.06)] backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#eb61a2_0%,#ff9f6e_100%)] text-white shadow-[0_10px_20px_rgba(235,97,162,0.2)]">
              {isAdminMode ? <FaHeadset /> : <FaWandSparkles />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5487f]">Skin.me</p>
              <h1 className="text-lg font-bold text-[#1f2937]">{modeLabel}</h1>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff1f6] p-1">
            <button
              type="button"
              onClick={() => switchChatMode(CHAT_MODE_AI)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                !isAdminMode ? "bg-white text-[#1f2937] shadow-sm" : "text-[#7c3a57] hover:bg-white/60"
              }`}
            >
              <FaRobot />
              AI Chat
            </button>
            <button
              type="button"
              onClick={() => switchChatMode(CHAT_MODE_ADMIN)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                isAdminMode ? "bg-white text-[#1f2937] shadow-sm" : "text-[#7c3a57] hover:bg-white/60"
              }`}
            >
              <FaUser />
              Admin
            </button>
          </div>

          <p className="text-sm leading-6 text-[#5b6473]">
            {isAdminMode
              ? "Chat directly with Skin.me support. Your messages are linked to your account."
              : "Ask skincare questions, upload a skin image, and get a clearer answer in a friendly chat space."}
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => createNewChat(activeMode)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#111827]"
            >
              <FaPlus />
              New conversation
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="mt-5 rounded-[28px] border border-[#f0d7e3] bg-white/85 p-5 shadow-[0_16px_32px_rgba(83,33,58,0.06)] backdrop-blur flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1f2937]">
              {isAdminMode ? "Support History" : "Chat History"}
            </p>
            <button
              onClick={() => createNewChat(activeMode)}
              className="text-xs px-3 py-1 rounded-full bg-[#eb61a2] text-white hover:bg-[#d94d8c] transition"
            >
              + New
            </button>
          </div>

          <div className="space-y-1">
            {filteredHistory.length === 0 && (
              <p className="text-xs text-[#6b7280] py-2">No conversations yet for this mode.</p>
            )}
            {filteredHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  if (editingChatId !== chat.id) switchChat(chat.id);
                }}
                onDoubleClick={() => startRenaming(chat)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${
                  currentChatId === chat.id ? "bg-[#fff2f8] border border-[#eb61a2]" : "hover:bg-[#fff8fb]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      autoFocus
                      className="w-full text-sm font-medium bg-white border border-[#eb61a2] rounded px-2 py-1 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1f2937] truncate">{chat.title}</p>
                  )}
                  <p className="text-[11px] text-[#6b7280]">{chat.messages.length} messages</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRenaming(chat);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#eb61a2] p-1 transition"
                    title="Rename chat"
                  >
                    <FaEdit className="text-xs" />
                  </button>

                  {chats.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 p-1"
                      title="Delete chat"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[#f0d7e3] bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1f2937]">
                {isAdminMode ? "Chat with Admin" : "Skin.me AI Chat"}
              </h2>
              <p className="text-sm text-[#6b7280]">
                {isAdminMode
                  ? adminConnected
                    ? "An admin is online for this session."
                    : wsStatus === "connected"
                      ? "Waiting for an admin to join..."
                      : "Connecting to support..."
                  : "Professional skincare guidance with friendly, human-sounding replies."}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#f0d7e3] bg-[#fff8fb] px-3 py-1.5 text-xs font-semibold text-[#7c3a57]">
              {isAdminMode ? <FaHeadset /> : <FaRobot />}
              {modeLabel}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl rounded-[28px] border px-5 py-4 shadow-[0_14px_32px_rgba(48,20,39,0.07)] ${
                    message.role === "user"
                      ? "border-[#eb61a2] bg-[linear-gradient(135deg,#eb61a2_0%,#f37fb3_100%)] text-white"
                      : "border-[#f0d7e3] bg-white text-[#1f2937]"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
                        message.role === "user" ? "bg-white/20 text-white" : "bg-[#fff1f6] text-[#c03f82]"
                      }`}
                    >
                      {message.role === "user" ? "You" : message.sender === "admin" ? "AD" : "AI"}
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                        message.role === "user" ? "text-white/75" : "text-[#b5487f]"
                      }`}
                    >
                      {message.role === "user"
                        ? "Customer"
                        : message.sender === "admin"
                          ? "Admin"
                          : "Assistant"}
                    </span>
                  </div>

                  {message.localImage && (
                    <a href={message.localImage} target="_blank" rel="noreferrer">
                      <img
                        src={message.localImage}
                        alt="Uploaded preview"
                        className="mb-4 max-h-[340px] w-full rounded-3xl object-cover"
                      />
                    </a>
                  )}

                  <div
                    className={`text-sm leading-7 ${message.role === "user" ? "text-white" : "text-[#334155]"}`}
                    dangerouslySetInnerHTML={{
                      __html: message.role === "assistant" ? message.html : formatAssistantHtml(message.text),
                    }}
                  />

{Array.isArray(message.images) && message.images.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {message.images.map((imageUrl, idx) => {
                          // Extract ALL productIds from text and match by index
                          const allProductIds = message.text ? [...message.text.matchAll(/productId=(\d+)/gi)].map(m => m[1]) : [];
                          const productId = allProductIds[idx];
                          return (
                            <a
                              key={imageUrl}
                              href={productId ? `/product_details?productId=${productId}` : imageUrl}
                              target={productId ? undefined : "_blank"}
                              rel={productId ? undefined : "noreferrer"}
                              className="group overflow-hidden rounded-3xl border border-[#f0d7e3] bg-[#fff8fb]"
                            >
                              <img
                                src={imageUrl}
                                alt="Product"
                                className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                              />
                              <div className="border-t border-[#f0d7e3] px-4 py-3 text-xs font-medium text-[#b5487f]">
                                {productId ? "View Product" : "Open image"}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}

                  <div
                    className={`mt-3 text-right text-[11px] ${
                      message.role === "user" ? "text-white/75" : "text-[#94a3b8]"
                    }`}
                  >
                    {message.time}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-xl rounded-[28px] border border-[#f0d7e3] bg-white px-5 py-4 shadow-[0_14px_32px_rgba(48,20,39,0.07)]">
                  <div className="flex items-center gap-3 text-sm text-[#64748b]">
                    <FaSpinner className="animate-spin text-[#eb61a2]" />
                    {isAdminMode
                      ? "Waiting for admin reply..."
                      : "Skin.me Assistant is preparing a helpful reply..."}
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-[#f0d7e3] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto max-w-5xl">
            {selectedImagePreview && (
              <div className="mb-4 rounded-[28px] border border-[#f0d7e3] bg-[#fff8fb] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#7c3a57]">
                    <FaPaperclip />
                    Image ready to send
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-[#b5487f] transition hover:bg-[#fff0f7]"
                  >
                    <FaTrashAlt />
                    Remove
                  </button>
                </div>
                <img
                  src={selectedImagePreview}
                  alt="Selected upload"
                  className="max-h-44 rounded-3xl object-cover"
                />
              </div>
            )}

            <div className="rounded-[30px] border border-[#ecd7e2] bg-white p-3 shadow-[0_16px_40px_rgba(60,15,40,0.08)]">
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAdminMode}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#c03f82] transition hover:bg-[#ffe6f1] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Upload skin image"
                  title={isAdminMode ? "Image upload is available in AI mode" : "Upload skin image"}
                >
                  <FaImage />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                <textarea
                  ref={composerInputRef}
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    isAdminMode
                      ? "Message Skin.me support..."
                      : selectedImage
                        ? "Add a note for this skin image..."
                        : "Message Skin.me Assistant..."
                  }
                  className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-[#1f2937] outline-none placeholder:text-[#94a3b8]"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && !selectedImage)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#eb61a2_0%,#ff9f6e_100%)] text-white shadow-[0_16px_24px_rgba(235,97,162,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaArrowUp />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
