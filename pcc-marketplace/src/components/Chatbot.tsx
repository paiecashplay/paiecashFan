"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, Bot, Mic, Square, MessageSquare, X, Sparkles, ChevronDown, Phone, PhoneOff, Users } from "lucide-react";
import { getChatThemeForClub, DEFAULT_CHAT_THEME } from "../clubChatThemes";
import { useChatbot } from "../context/ChatbotContext";
import { supabase } from "../api";
import { getClubMessages, postClubMessage } from "../data/clubChannelsData";

// --- DYNAMIC GEMINI-STYLE LOADER COMPONENT ---
export const DynamicGeminiLoader = ({ T }: { T: typeof DEFAULT_CHAT_THEME }) => {
  const phrases = [
    "Analyzing request...",
    "Scanning knowledge base...",
    "Drafting response...",
    "Synthesizing...",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[85%] mt-1 mb-2">
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        @keyframes magical-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .magical-glow {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0%, ${T.bronze} 25%, ${T.gold} 50%, ${T.accent} 75%, transparent 100%);
          animation: magical-spin 2s linear infinite;
          filter: blur(4px);
        }
        .text-shimmer {
          background-size: 200% auto;
          animation: shine 3s linear infinite;
        }
        .phrase-animate {
          animation: fade-up 2s ease-in-out forwards;
        }
      `}</style>
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div className="magical-glow" style={{ boxShadow: `0 0 15px ${T.bronze}99` }}></div>
          <div className="relative z-10 rounded-full w-full h-full flex items-center justify-center" style={{ background: T.void, border: `1px solid ${T.surface}` }}>
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: T.gold }} />
          </div>
        </div>
        <div className="flex flex-col w-full pt-1">
          <div className="h-[28px] flex items-center relative">
            <span key={index} className="absolute whitespace-nowrap flex items-center text-xs font-semibold tracking-wide text-transparent bg-clip-text text-shimmer phrase-animate py-1" style={{ backgroundImage: `linear-gradient(to right, ${T.bronze}, ${T.gold}, ${T.accent})` }}>
              {phrases[index]}
            </span>
          </div>
          <div className="flex gap-2 mt-1.5 opacity-80">
            <div className="h-1.5 w-full max-w-[70px] rounded-full text-shimmer" style={{ backgroundImage: `linear-gradient(to right, transparent, ${T.bronze}80, transparent)`, boxShadow: `0 0 8px ${T.bronze}66` }}></div>
            <div className="h-1.5 w-full max-w-[40px] rounded-full text-shimmer" style={{ backgroundImage: `linear-gradient(to right, transparent, ${T.gold}80, transparent)`, boxShadow: `0 0 8px ${T.gold}66`, animationDelay: "1s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SMOOTH TYPING EFFECT COMPONENT ---
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {part}
        </a>
      );
    }
    return part;
  });
};

const SmoothTypingMessage = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (displayedContent.length < content.length) {
      interval = setInterval(() => {
        setDisplayedContent(prev => {
          const nextChars = content.slice(prev.length, prev.length + 2);
          const nextStr = prev + nextChars;
          if (nextStr.length >= content.length) {
            clearInterval(interval);
            return content;
          }
          return nextStr;
        });
      }, 15);
    }
    return () => clearInterval(interval);
  }, [content, displayedContent.length]);

  return <>{renderMessageWithLinks(displayedContent)}</>;
};

const SplashAnimation = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: isDark ? 'rgba(15, 15, 18, 0.4)' : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
      }}>

      {/* 5-second timeline container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center animate-[splashTimeline_5s_ease-in-out_forwards]">

        <div className="relative w-40 h-40 flex items-center justify-center animate-[breathe_3s_ease-in-out_infinite]">
          {/* Ring 1 - Outer */}
          <div className="absolute w-36 h-36 rounded-full border border-transparent animate-[spin_3s_linear_infinite]"
            style={{ borderTopColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)', borderRightColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
          </div>

          {/* Ring 2 - Middle (Counter-spin) */}
          <div className="absolute w-28 h-28 rounded-full border border-transparent animate-[spin_2s_linear_infinite_reverse]"
            style={{ borderBottomColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', borderLeftColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}>
          </div>

          {/* Ring 3 - Inner */}
          <div className="absolute w-20 h-20 rounded-full border border-transparent animate-[spin_1.5s_linear_infinite]"
            style={{ borderTopColor: isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.8)', borderLeftColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }}>
          </div>

          {/* Core Pulse */}
          <div className="absolute w-12 h-12 flex items-center justify-center rounded-full animate-ping opacity-20"
            style={{ background: isDark ? '#ffffff' : '#000000' }}>
          </div>

          {/* Center Bot Icon */}
          <div className="relative z-10 p-4 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backdropFilter: 'blur(4px)' }}>
            <Bot className="w-7 h-7" style={{ color: isDark ? '#ffffff' : '#333333' }} />
          </div>
        </div>

        {/* Engaging Timeline Text */}
        <div className="mt-8 flex flex-col items-center h-14 relative w-full">

          {/* Text slider mask (exactly the height of one line) */}
          <div className="h-6 overflow-hidden flex flex-col items-center w-full relative">
            <div className="flex flex-col items-center transition-transform animate-[textSlide_5s_ease-in-out_forwards]">
              <span className="h-6 flex items-center justify-center text-[11px] font-[500] tracking-[0.2em] uppercase opacity-70" style={{ color: isDark ? '#ffffff' : '#111111' }}>Initializing</span>
              <span className="h-6 flex items-center justify-center text-[11px] font-[500] tracking-[0.2em] uppercase opacity-70" style={{ color: isDark ? '#ffffff' : '#111111' }}>Connecting</span>
              <span className="h-6 flex items-center justify-center text-[11px] font-[500] tracking-[0.2em] uppercase opacity-70" style={{ color: isDark ? '#ffffff' : '#111111' }}>Ready</span>
            </div>
          </div>

          {/* Bouncing dots under the text */}
          <div className="flex gap-1.5 mt-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite]" style={{ background: isDark ? '#fff' : '#000', animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite]" style={{ background: isDark ? '#fff' : '#000', animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_infinite]" style={{ background: isDark ? '#fff' : '#000', animationDelay: '0.4s' }}></div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes splashTimeline {
          0% { opacity: 0; transform: scale(0.95); filter: blur(5px); }
          10% { opacity: 1; transform: scale(1); filter: blur(0px); }
          90% { opacity: 1; transform: scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.1); filter: blur(15px); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes textSlide {
          0%, 25% { transform: translateY(0); }
          35%, 65% { transform: translateY(-24px); }
          75%, 100% { transform: translateY(-48px); }
        }
      `}</style>
    </div>
  );
};

const API_KEY = "frosty_006cd59d_VlPObGwQ8QAkOqAbxBbLB7eZkez7199z";


interface ChatWidgetProps {
  apiKey?: string;
  botName?: string;
  botTagline?: string;
  channel?: string;
  clubId?: string | null;
}

export default function ChatWidget({
  apiKey = API_KEY,
  botName,
  botTagline,
  channel = "website",
  clubId: propClubId = null,
}: ChatWidgetProps) {
  // Resolve club from prop or from ChatbotContext (always available via ChatbotProvider)
  const { activeClubId: contextClubId } = useChatbot();
  const activeClubId = propClubId || contextClubId;

  // Dynamic theme - recalculated when club changes
  const T = useMemo(() => getChatThemeForClub(activeClubId), [activeClubId]);
  const isDark = true;

  // Resolve display names from club theme
  const resolvedBotName = botName || (T.clubName ? `${T.clubName} AI` : "AI Assistant");
  const resolvedBotTagline = botTagline || (T.tagline || "Online & Ready");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Inject Tailwind CDN safely without preflight to prevent breaking existing styles
    if (!document.getElementById("tailwind-config")) {
      const configScript = document.createElement("script");
      configScript.id = "tailwind-config";
      configScript.innerHTML = `
        window.tailwind = {
          config: {
            corePlugins: { preflight: false }
          }
        };
      `;
      document.head.appendChild(configScript);
    }
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSplashing, setIsSplashing] = useState(false);
  const [hasWarmedUp, setHasWarmedUp] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'ai' | 'human'>('ai');

  // ── Community Chat Tab State ──────────────────────────────────
  const [chatTab, setChatTab] = useState<'ai' | 'community'>('ai');
  const [communityMessages, setCommunityMessages] = useState<Record<string, any[]>>({});
  const [communityInput, setCommunityInput] = useState("");
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityOnline, setCommunityOnline] = useState(0);
  const communityChannelRef = useRef<any>(null);
  const communityPresenceRef = useRef<any>(null);
  const communityScrollRef = useRef<HTMLDivElement>(null);
  const communityEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedClubRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsConnectRef = useRef<Promise<WebSocket | null> | null>(null);
  const tenantIdRef = useRef<string>("default");
  const sessionIdRef = useRef<string>("");
  const lastWarmupAtRef = useRef<number>(0);

  // Mic state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice call state
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "listening" | "thinking" | "speaking" | "idle">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const callWsRef = useRef<WebSocket | null>(null);
  const callMediaRef = useRef<MediaRecorder | null>(null);
  const callStreamRef = useRef<MediaStream | null>(null);
  const callAudioQueueRef = useRef<Uint8Array[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Click-outside refs
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);

  // Animated close
  const triggerClose = () => {
    if (!isOpen || isClosing) return;
    setIsClosing(true);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 700);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        isOpen && !isClosing &&
        chatWindowRef.current && !chatWindowRef.current.contains(e.target as Node) &&
        fabRef.current && !fabRef.current.contains(e.target as Node)
      ) triggerClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll to bottom immediately (used during streaming)
  const scrollToBottom = (smooth = true) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  };

  // Prevent website scroll when scrolling inside chat
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Only stop the event from bubbling up to the page.
      // Do NOT call preventDefault() - that kills native scrolling inside the chat.
      e.stopPropagation();
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // ── Community: subscribe when tab=community & club is active ──
  useEffect(() => {
    if (chatTab !== 'community' || !activeClubId || !isOpen) return;
    // Only load once per club
    if (lastLoadedClubRef.current === activeClubId) return;
    lastLoadedClubRef.current = activeClubId;

    setCommunityLoading(true);
    getClubMessages(activeClubId, 100)
      .then((msgs: any[]) => {
        setCommunityMessages(prev => ({ ...prev, [activeClubId]: msgs }));
      })
      .catch(() => { })
      .finally(() => setCommunityLoading(false));

    // Realtime messages
    if (communityChannelRef.current) supabase.removeChannel(communityChannelRef.current);
    const ch = supabase
      .channel(`club-msgs-${activeClubId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'club_messages', filter: `club_id=eq.${activeClubId}` }, (payload: any) => {
        setCommunityMessages(prev => {
          const existing = prev[activeClubId] || [];
          if (existing.some((m: any) => m.id === payload.new.id)) return prev;
          const filtered = existing.filter((m: any) => !(m._optimistic && m.message === payload.new.message && m.user_id === payload.new.user_id));
          return { ...prev, [activeClubId]: [...filtered, payload.new] };
        });
      })
      .subscribe();
    communityChannelRef.current = ch;

    // Presence
    if (communityPresenceRef.current) supabase.removeChannel(communityPresenceRef.current);
    const uid = (() => { try { const r = localStorage.getItem('pcc_user'); return r ? JSON.parse(r).id : 'anon'; } catch { return 'anon'; } })();
    const pCh = supabase
      .channel(`presence-club-${activeClubId}`, { config: { presence: { key: uid } } })
      .on('presence', { event: 'sync' }, () => {
        setCommunityOnline(Object.keys(pCh.presenceState()).length);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') await pCh.track({ uid, club: activeClubId });
      });
    communityPresenceRef.current = pCh;

    return () => {
      if (communityChannelRef.current) { supabase.removeChannel(communityChannelRef.current); communityChannelRef.current = null; }
      if (communityPresenceRef.current) { supabase.removeChannel(communityPresenceRef.current); communityPresenceRef.current = null; }
    };
  }, [chatTab, activeClubId, isOpen]);

  // Reset loaded club when club changes so it reloads
  useEffect(() => { lastLoadedClubRef.current = null; }, [activeClubId]);

  // Auto-scroll community
  useEffect(() => {
    if (chatTab === 'community' && communityEndRef.current) {
      communityEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communityMessages, chatTab]);

  const sendCommunityMessage = useCallback(async () => {
    if (!communityInput.trim() || !activeClubId) return;
    const text = communityInput.trim();
    setCommunityInput("");
    const stored = (() => { try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; } })();
    const userId = stored.id || 'anon';
    const username = stored.name || stored.email?.split('@')[0] || 'Fan';
    const colors = ['#00ff88', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const avatarColor = colors[parseInt(userId.replace(/\D/g, '').slice(0, 4) || '0') % colors.length];
    const optimistic = { id: `_opt_${Date.now()}`, club_id: activeClubId, user_id: userId, username, avatar_color: avatarColor, message: text, message_type: 'text', created_at: new Date().toISOString(), _optimistic: true };
    setCommunityMessages(prev => ({ ...prev, [activeClubId]: [...(prev[activeClubId] || []), optimistic] }));
    try { await postClubMessage(activeClubId, { message: text }); } catch { }
  }, [communityInput, activeClubId]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 60;
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsAtBottom(atBottom);
  };


  const generateSessionId = () => {
    let sid = sessionStorage.getItem("frosty_session");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("frosty_session", sid);
    }
    return sid;
  };

  const getBridgedSessionId = (sid: string) => {
    if (!sid) return sid;
    if (sid.includes("--")) return sid;
    const tid = tenantIdRef.current || "default";
    return `${tid}--${channel}--${sid}`;
  };


  const resolveApiBase = () => {
    // Use import.meta.env for Vite projects
    const vBot = import.meta.env.VITE_BOT_URL || "";
    if (vBot) return vBot.replace(/\/$/, "");

    const vApi = import.meta.env.VITE_API_URL || "";
    if (vApi) return vApi.replace(/\/$/, "");

    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // In local dev, use the Vite proxy to avoid CORS
    if (IS_LOCAL) return "/bot-api";

    // In production, use the absolute URL directly
    // This assumes the bot server handles CORS for the production domain
    return "https://bot.frostrek.com/bot-api";
  };

  const resolveWsBases = () => {
    const out: string[] = [];

    // 1. Check environment variables
    const vWs = import.meta.env.VITE_WS_URL || "";
    if (vWs) out.push(vWs.replace(/\/$/, ""));

    const apiBase = resolveApiBase();
    if (/^https?:\/\//i.test(apiBase)) {
      try {
        const parsed = new URL(apiBase);
        const wsProto = parsed.protocol === "https:" ? "wss:" : "ws:";
        out.push(`${wsProto}//${parsed.host}${parsed.pathname.replace(/\/$/, "")}`);
      } catch {
        // Ignore parse issues and keep fallback candidates.
      }
    } else if (apiBase === "/bot-api") {
      // If apiBase is relative (like /bot-api for CORS proxying in dev),
      // we can try proxying WebSockets through the same path.
      const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
      out.push(`${wsProto}//${window.location.host}/bot-api`);
    }

    // 2. Absolute fallback for production
    out.push("wss://bot.frostrek.com/bot-api");

    // 3. Local development fallbacks
    out.push("ws://localhost:8001");
    out.push("ws://127.0.0.1:8001");
    out.push("ws://localhost:8010");
    out.push("ws://127.0.0.1:8010");
    out.push("ws://localhost:8000");

    return Array.from(new Set(out));
  };

  const attachSocketHandlers = (ws: WebSocket) => {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const role = String(data?.role || "").toLowerCase();
        const text = String(data?.text || "").trim();

        if (data.mode === "ai" || data.mode === "human") {
          setChatMode(data.mode);
        }

        if (!text) return;

        if (role === "assistant") {
          setChatMode("ai");
          setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } else if (role === "admin" || role === "agent") {
          setChatMode("human");
          // Normalize to assistant so it renders properly with an avatar
          setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } else {
          if (text.toLowerCase().includes("connected to a support agent")) {
            setChatMode("human");
          }
          setMessages(prev => [...prev, { role: 'system', content: text }]);
        }

        setIsLoading(false);
        setTimeout(() => scrollToBottom(), 50);
      } catch {
        // Ignore malformed ws payloads.
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      setChatMode('ai');
      setIsLoading(false);
    };
  };

  const connectSocket = async (sessionId: string): Promise<WebSocket | null> => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    if (wsConnectRef.current) {
      return wsConnectRef.current;
    }

    const attempt = async (): Promise<WebSocket | null> => {
      const bases = resolveWsBases();
      const bridgedId = getBridgedSessionId(sessionId);
      for (const base of bases) {
        const url = `${base}/ws/chat/${bridgedId}`;
        try {
          const ws = await new Promise<WebSocket>((resolve, reject) => {
            const candidate = new WebSocket(url);
            const timer = setTimeout(() => {
              try { candidate.close(); } catch { }
              reject(new Error("timeout"));
            }, 2500);

            candidate.onopen = () => {
              clearTimeout(timer);
              resolve(candidate);
            };
            candidate.onerror = () => {
              clearTimeout(timer);
              try { candidate.close(); } catch { }
              reject(new Error("error"));
            };
            candidate.onclose = () => {
              clearTimeout(timer);
              reject(new Error("closed"));
            };
          });

          wsRef.current = ws;
          attachSocketHandlers(ws);
          return ws;
        } catch {
          // Try next candidate.
        }
      }
      return null;
    };

    wsConnectRef.current = attempt();
    const connected = await wsConnectRef.current;
    wsConnectRef.current = null;
    return connected;
  };

  const ensureTenantContext = async () => {
    if (tenantIdRef.current && tenantIdRef.current !== "default") return;
    try {
      const apiBase = resolveApiBase();
      const res = await fetch(`${apiBase}/tenant/bot-config`, {
        headers: {
          "x-api-key": apiKey,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const tenantId = String(data?.tenant_id || data?.tenant?.tenant_id || "").trim();
      if (tenantId) {
        tenantIdRef.current = tenantId;
      }
    } catch {
      // Keep default tenant fallback.
    }
  };

  const streamResponse = async (fetchPromise: Promise<Response>) => {
    const response = await fetchPromise;
    if (!response.ok) throw new Error("Network response was not ok");

    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.startsWith("data: ")) {
          const jsonStr = part.replace("data: ", "").trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: updated[lastIdx].content + data.token,
                };
                return updated;
              });
              // Auto-scroll on every token if user is near bottom
              const container = scrollContainerRef.current;
              if (container) {
                const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
                if (nearBottom) container.scrollTop = container.scrollHeight;
              }
            }

            // Human takeover: remove the pending empty bot bubble immediately
            if (data.human_takeover) {
              setMessages((prev) => {
                // Remove trailing empty assistant bubble
                const last = prev[prev.length - 1];
                if (last && last.role === "assistant" && !last.content) {
                  return prev.slice(0, -1);
                }
                return prev;
              });
              setIsLoading(false);
              return; // stop processing this stream
            }

            if (data.final && data.final.reply) {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: data.final.reply,
                };
                return updated;
              });
              setIsLoading(false);
              // Scroll to bottom when final reply arrives
              setTimeout(() => scrollToBottom(), 50);
            }

            // Handle final with empty reply (e.g. disabled/human mode)
            if (data.final && data.final.reply === "") {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "assistant" && !last.content) {
                  return prev.slice(0, -1);
                }
                return prev;
              });
            }


          } catch (e) {
            // Ignore malformed chunks
          }
        }
      }
    }
  };

  const runSilentWarmup = async (sessionId: string) => {
    try {
      const apiBase = resolveApiBase();
      await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          message: "hi",
          session_id: getBridgedSessionId(sessionId),
          channel: channel,
        }),
      });
    } catch {
      // Warmup is best-effort and should never disrupt UX.
    }
  };

  const handleOpenWidget = async () => {
    setIsOpen(true);
    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;

    if (!hasWarmedUp) {
      // ── Show splash + loader IMMEDIATELY - before any network calls ────
      setHasWarmedUp(true);
      setIsSplashing(true);
      setIsLoading(true);
      lastWarmupAtRef.current = Date.now();
      setMessages([{ role: "assistant", content: "" }]);

      // Resolve tenant and connect socket in parallel (don't block splash)
      void ensureTenantContext().then(() => {
        void connectSocket(sessionId);
      });

      const apiBase = resolveApiBase();
      // Stream the warmup "hi" - hide splash ONLY when the response arrives
      void streamResponse(
        fetch(`${apiBase}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            message: "hi",
            session_id: getBridgedSessionId(sessionId),
            channel: channel,
          }),
        })
      )
        .catch(() => {
          setMessages([{ role: "assistant", content: "Hi there! How can I help you today?" }]);
        })
        .finally(() => {
          // Dismiss splash as soon as backend responds (or fails)
          setIsSplashing(false);
          setIsLoading(false);
        });

      return;
    }

    // Widget re-opened after first warmup - resolve tenant + reconnect silently
    await ensureTenantContext();
    void connectSocket(sessionId);

    const now = Date.now();
    if (now - lastWarmupAtRef.current > 30000) {
      lastWarmupAtRef.current = now;
      void runSilentWarmup(sessionId);
    }
  };


  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    const sessionId = sessionIdRef.current || generateSessionId();
    sessionIdRef.current = sessionId;

    if (chatMode === "human") {
      const bridgedId = getBridgedSessionId(sessionId);
      const ws = await connectSocket(bridgedId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            text: userText,
            tenant_id: tenantIdRef.current || "default",
            session_id: bridgedId,
            user_email: "",
          })
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Live support is unavailable right now. Please try again." },
      ]);
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);
    // Scroll immediately so the loader bubble is always visible
    setTimeout(() => scrollToBottom(false), 20);

    try {
      const apiBase = resolveApiBase();
      await streamResponse(
        fetch(`${apiBase}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            message: userText,
            session_id: getBridgedSessionId(sessionId),
            channel: channel,
          }),
        })
      );
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };



  // ── Voice Call ──────────────────────────────────────────────────────────────
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      callStreamRef.current = stream;
      setIsInCall(true);
      setCallStatus("connecting");
      setLiveTranscript("");

      const apiBase = resolveApiBase();
      const wsBase = apiBase.replace(/^http/, "ws");
      const sid = getBridgedSessionId(sessionIdRef.current || generateSessionId());
      const wsUrl = `${wsBase}/ws/voice-call/${encodeURIComponent(sid)}`;
      const ws = new WebSocket(wsUrl);
      callWsRef.current = ws;

      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        // Send init handshake with API key
        ws.send(JSON.stringify({ api_key: apiKey }));
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
          // Binary = TTS audio chunk → collect
          callAudioQueueRef.current.push(new Uint8Array(event.data));
          return;
        }

        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case "ready":
              setCallStatus("listening");
              // Start streaming mic to server
              _startMicStream(ws, stream);
              break;
            case "transcript":
              setLiveTranscript(msg.text);
              break;
            case "user_final":
              setMessages(prev => [...prev, { role: "user", content: msg.text }]);
              setLiveTranscript("");
              break;
            case "thinking":
              setCallStatus("thinking");
              break;
            case "bot_reply":
              setMessages(prev => [...prev, { role: "assistant", content: msg.text }]);
              break;
            case "audio_start":
              setCallStatus("speaking");
              callAudioQueueRef.current = [];
              break;
            case "audio_end":
              // Play collected audio
              _playCallAudio();
              break;
            case "error":
              console.error("[CALL] Server error:", msg.message);
              endCall();
              break;
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        if (callWsRef.current === ws) {
          endCall();
        }
      };

      ws.onerror = () => {
        console.error("[CALL] WebSocket error");
        endCall();
      };

    } catch (err) {
      console.error("[CALL] Mic error:", err);
      alert("Cannot access microphone. Please check browser permissions.");
      setIsInCall(false);
      setCallStatus("idle");
    }
  };

  const _startMicStream = (ws: WebSocket, stream: MediaStream) => {
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    callMediaRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(e.data);
      }
    };

    recorder.start(250); // send chunk every 250ms
  };

  const _playCallAudio = async () => {
    const chunks = callAudioQueueRef.current;
    if (chunks.length === 0) {
      setCallStatus("listening");
      return;
    }

    try {
      // Combine all chunks into one buffer
      const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      callAudioQueueRef.current = [];

      const blob = new Blob([merged as any], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setCallStatus("listening");
      };
      audio.play().catch(e => {
        console.warn("[CALL] audio play blocked:", e);
        setCallStatus("listening");
      });
    } catch (e) {
      console.warn("[CALL] audio decode error:", e);
      setCallStatus("listening");
    }
  };

  const endCall = () => {
    // Stop mic
    if (callMediaRef.current && callMediaRef.current.state !== "inactive") {
      callMediaRef.current.stop();
    }
    callMediaRef.current = null;

    // Stop stream tracks
    if (callStreamRef.current) {
      callStreamRef.current.getTracks().forEach(t => t.stop());
      callStreamRef.current = null;
    }

    // Close WebSocket
    if (callWsRef.current) {
      try {
        callWsRef.current.send(JSON.stringify({ type: "hangup" }));
      } catch { }
      try {
        callWsRef.current.close();
      } catch { }
      callWsRef.current = null;
    }

    setIsInCall(false);
    setCallStatus("idle");
    setLiveTranscript("");
    callAudioQueueRef.current = [];
  };


  return (
    <>
      <style>{`
        .frostrek-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .frostrek-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .frostrek-scrollbar::-webkit-scrollbar-thumb {
          background: ${T.scrollThumb};
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .frostrek-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${T.scrollThumbHover};
        }

        /* ── Message entrance animation ── */
        @keyframes msg-slide-in {
          0%   { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.97); }
          60%  { opacity: 1; transform: translate3d(0, -2px, 0) scale(1.005); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        .chat-msg-enter {
          animation: msg-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        /* ── FAB breathing glow ── */
        @keyframes fab-breathe {
          0%, 100% { box-shadow: 0 0 20px ${T.bronze}44, 0 8px 32px rgba(0,0,0,0.3); }
          50%      { box-shadow: 0 0 35px ${T.bronze}66, 0 8px 40px rgba(0,0,0,0.35); }
        }
        .fab-glow {
          animation: fab-breathe 3s ease-in-out infinite;
        }

        /* ── Close button smooth hover ── */
        .chat-close-btn {
          transition: background 0.25s ease, transform 0.2s ease;
        }
        .chat-close-btn:hover {
          transform: scale(1.1);
        }
        .chat-close-btn:active {
          transform: scale(0.92);
        }

        /* ── Bubble hover lift ── */
        .chat-bubble {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .chat-bubble:hover {
          transform: translateY(-1px);
        }
      `}</style>

      <style>{`
        @keyframes fab-pop-in {
          0%   { transform: scale(0) rotate(-200deg); opacity:0; }
          65%  { transform: scale(1.18) rotate(12deg);  opacity:1; }
          82%  { transform: scale(0.93) rotate(-6deg); }
          100% { transform: scale(1) rotate(0deg);     opacity:1; }
        }
        @keyframes fab-pop-out {
          0%   { transform: scale(1) rotate(0deg);   opacity:1; }
          100% { transform: scale(0) rotate(180deg); opacity:0; }
        }
        @keyframes window-open {
          0%   { transform: scale(0.45) translate3d(0, 80px, 0);  opacity:0; filter:blur(16px); }
          55%  { transform: scale(1.03) translate3d(0, -6px, 0);  opacity:1; filter:blur(0); }
          75%  { transform: scale(0.98) translate3d(0, 3px, 0); }
          100% { transform: scale(1)    translate3d(0, 0, 0);    opacity:1; filter:blur(0); }
        }
        @keyframes window-close {
          0%   { transform: scale(1) translate3d(0, 0, 0) rotate(0deg);     opacity:1; filter:blur(0); }
          25%  { transform: scale(1.04) translate3d(0, -10px, 0) rotate(0deg); opacity:1; }
          100% { transform: scale(0.08) translate3d(0, 140px, 0) rotate(10deg); opacity:0; filter:blur(20px); }
        }
      `}</style>

      {/* ── Floating Action Button ── */}
      <div
        ref={fabRef}
        className="fixed bottom-6 right-6 z-50"
        style={{
          animation: isOpen
            ? 'fab-pop-out 0.38s cubic-bezier(0.4,0,1,1) forwards'
            : 'fab-pop-in 0.72s cubic-bezier(0.34,1.56,0.64,1) forwards',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
      >
        <button
          onClick={handleOpenWidget}
          className="relative group w-16 h-16 flex items-center justify-center rounded-full p-[2px] fab-glow transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${T.bronze}, ${T.gold}, ${T.accent})`,
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-40 blur-xl group-hover:opacity-70 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${T.bronze}, ${T.gold})` }}></div>
          <div className="relative w-full h-full rounded-full flex items-center justify-center group-hover:bg-transparent transition-all duration-300 overflow-hidden" style={{ background: T.void }}>
            <MessageSquare className="w-7 h-7 transition-all duration-300 relative z-10 group-hover:scale-110" style={{ color: T.gold }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: `linear-gradient(135deg, ${T.bronze}, ${T.gold})` }}></div>
          </div>
        </button>
      </div>

      {/* ── Chat Window ── */}
      <div
        ref={chatWindowRef}
        className="fixed bottom-6 right-6 w-[400px] h-[650px] max-h-[85vh] max-w-[calc(100vw-3rem)] flex flex-col z-50"
        style={{
          transformOrigin: 'bottom right',
          willChange: 'transform, opacity, filter',
          animation: (!isOpen && !isClosing)
            ? 'none'
            : isClosing
              ? 'window-close 0.70s cubic-bezier(0.4,0,1,1) forwards'
              : 'window-open  0.72s cubic-bezier(0.34,1.56,0.64,1) forwards',
          pointerEvents: (!isOpen || isClosing) ? 'none' : 'auto',
          display: (!isOpen && !isClosing) ? 'none' : 'flex',
        }}
      >
        {/* Warm glow behind glass */}
        <div className="absolute inset-0 blur-3xl -z-10 rounded-3xl" style={{ background: `linear-gradient(135deg, ${T.bronze}1A, ${T.gold}0D, ${T.accent}0D)` }}></div>

        {/* Main Glass Panel */}
        <div className="flex-1 flex flex-col backdrop-blur-2xl rounded-3xl overflow-hidden relative transition-colors duration-300" style={{
          background: isDark ? `${T.pane}E6` : `${T.pane}F2`,
          border: `1px solid ${isDark ? T.surface + '55' : T.surface + '88'}`,
          boxShadow: isDark
            ? `0 20px 60px -15px rgba(0,0,0,0.5), 0 0 40px -10px ${T.bronze}26`
            : `0 20px 60px -15px rgba(0,0,0,0.15), 0 0 40px -10px ${T.bronze}1A`,
        }}>

          {isSplashing && <SplashAnimation isDark={isDark} />}

          {/* Wrapper to fade in the actual chat contents after splash */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-1000 ${isSplashing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

            {/* Noise overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

            {/* Header */}
            <div className="relative px-5 py-4 flex items-center justify-between transition-colors duration-300" style={{
              borderBottom: `1px solid ${isDark ? T.surface + '44' : T.surface + '66'}`,
              background: isDark
                ? `linear-gradient(to bottom, ${T.card}CC, transparent)`
                : `linear-gradient(to bottom, ${T.card}CC, transparent)`,
            }}>
              {/* Top edge warm highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${T.bronze}66, transparent)` }}></div>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center p-[2px] overflow-hidden group">
                  <div className="absolute inset-0 animate-[spin_4s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite]" style={{ background: `linear-gradient(135deg, ${T.bronze}, ${T.gold}, ${T.accent})` }}></div>
                  <div className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-md shadow-inner overflow-hidden" style={{ background: T.void }}>
                    {T.crestUrl ? (
                      <img
                        src={T.crestUrl}
                        alt={T.clubName || 'Club'}
                        className="w-6 h-6 object-contain drop-shadow-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Bot className="w-5 h-5" style={{ color: isDark ? T.gold : T.bronzeDark }} />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-['Raleway'] font-semibold tracking-wide text-[15px] flex items-center gap-2" style={{ color: T.text }}>
                    {resolvedBotName}
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: T.gold }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: T.gold }}></span>
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="font-['Quicksand'] text-[11px] uppercase tracking-wider" style={{ color: T.textMuted }}>{resolvedBotTagline}</p>
                    {chatMode === 'human' && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter" style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}>
                        Live Support
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={triggerClose}
                className="w-8 h-8 flex items-center justify-center rounded-full chat-close-btn hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: T.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── AI / Community Toggle ── */}
            {activeClubId && (
              <div className="flex items-center px-3 py-1.5" style={{ borderBottom: `1px solid ${isDark ? T.surface + '33' : T.surface + '55'}`, background: isDark ? `${T.void}44` : `${T.card}44` }}>
                <button onClick={() => setChatTab('ai')} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all" style={{ background: chatTab === 'ai' ? `${T.bronze}33` : 'transparent', color: chatTab === 'ai' ? T.gold : T.textMuted, border: chatTab === 'ai' ? `1px solid ${T.bronze}55` : '1px solid transparent' }}>
                  <Sparkles className="w-3 h-3" /> AI Chat
                </button>
                <button onClick={() => setChatTab('community')} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all" style={{ background: chatTab === 'community' ? `${T.bronze}33` : 'transparent', color: chatTab === 'community' ? T.gold : T.textMuted, border: chatTab === 'community' ? `1px solid ${T.bronze}55` : '1px solid transparent' }}>
                  <Users className="w-3 h-3" /> Community {communityOnline > 0 && <span className="text-[9px] px-1 rounded-full" style={{ background: `${T.gold}22`, color: T.gold }}>{communityOnline}</span>}
                </button>
              </div>
            )}

            {/* Chat Area */}
            {chatTab === 'ai' ? (
              <div className="relative flex-1 bg-transparent overflow-hidden flex flex-col pt-2">
                <div
                  ref={scrollContainerRef}
                  className="absolute inset-0 overflow-y-auto p-5 pb-[80px] space-y-6 frostrek-scrollbar"
                  style={{ overscrollBehavior: 'contain', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                  onScroll={handleScroll}
                >
                  {messages.map((msg, i) => {
                    const normalizedRole = String(msg.role || "").toLowerCase();
                    const isUser = normalizedRole === "user";
                    const isAdmin = normalizedRole === "admin" || normalizedRole === "agent";
                    const isAssistant = normalizedRole === "assistant";
                    return (
                      <div key={i} className={`flex gap-3 group chat-msg-enter ${isUser ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>

                        {/* Agent / Admin Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm relative overflow-hidden" style={{
                            background: isAssistant && !isAdmin ? `linear-gradient(135deg, ${T.bronze}33, ${T.gold}33)` : `linear-gradient(135deg, #00BFA633, #00BFA666)`,
                            border: `1px solid ${isDark ? T.surface + '44' : T.surface + '66'}`,
                          }}>
                            {isAdmin ? (
                              <div className="text-[10px] font-bold text-[#00BFA6]">STAFF</div>
                            ) : (
                              <Sparkles className="w-4 h-4" style={{ color: T.bronze }} />
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-1 max-w-[82%]">
                          {isAdmin && (
                            <div className="text-[9px] font-bold uppercase tracking-widest px-1" style={{ color: T.textMuted }}>Live Support</div>
                          )}
                          <div
                            className="relative px-4 py-3 text-sm transition-all duration-300 shadow-sm chat-bubble"
                            style={isUser
                              ? {
                                background: T.userBubbleBg,
                                color: T.userBubbleText,
                                borderRadius: "1rem 0.25rem 1rem 1rem",
                                boxShadow: `0 4px 15px ${T.bronze}33, inset 0 1px 0 ${T.bronzeLight}44`,
                              }
                              : {
                                background: isAdmin ? (isDark ? `linear-gradient(135deg, #00BFA610, #00BFA630)` : `linear-gradient(135deg, #00BFA610, #00BFA620)`) : (isDark ? `linear-gradient(135deg, ${T.card}D9, ${T.surface}55)` : `linear-gradient(135deg, ${T.card}, ${T.pane})`),
                                border: `1px solid ${isAdmin ? '#00BFA644' : (isDark ? T.surface + '55' : T.surface + '88')}`,
                                color: T.text,
                                borderRadius: "0.25rem 1rem 1rem 1rem",
                                fontFamily: "'Quicksand', sans-serif",
                                lineHeight: "1.6",
                                letterSpacing: "0.01em",
                              }
                            }
                          >
                            {(isAssistant || isAdmin) && (
                              <div className="whitespace-pre-wrap">
                                {msg.content ? <SmoothTypingMessage content={msg.content} /> : <DynamicGeminiLoader T={T} />}
                              </div>
                            )}
                            {!isAssistant && !isAdmin && <div className="whitespace-pre-wrap">{renderMessageWithLinks(msg.content)}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none" style={{ background: `linear-gradient(to top, ${isDark ? T.pane + 'E6' : T.pane + 'F2'}, transparent)` }}></div>

                {/* Jump to bottom */}
                <div className={`absolute left-0 right-0 bottom-6 flex justify-center transition-all duration-300 ${isAtBottom ? 'translate-y-10 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                  <button
                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="backdrop-blur-md p-2 rounded-full shadow-lg transition-all z-10"
                    style={{
                      background: isDark ? `${T.card}E6` : `${T.card}F2`,
                      border: `1px solid ${isDark ? T.surface + '44' : T.surface + '66'}`,
                      color: T.text,
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ── Community Chat Panel ── */
              <div className="relative flex-1 bg-transparent overflow-hidden flex flex-col pt-2">
                <div ref={communityScrollRef} className="absolute inset-0 overflow-y-auto p-4 pb-[80px] space-y-3 frostrek-scrollbar" style={{ overscrollBehavior: 'contain' }}>
                  {communityLoading && <div className="text-center text-xs py-8" style={{ color: T.textMuted }}>Loading messages...</div>}
                  {!communityLoading && (communityMessages[activeClubId || ''] || []).length === 0 && (
                    <div className="text-center py-12" style={{ color: T.textMuted }}>
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <div className="text-sm font-semibold mb-1">No messages yet</div>
                      <div className="text-xs opacity-70">Be the first to say hello!</div>
                    </div>
                  )}
                  {(communityMessages[activeClubId || ''] || []).map((msg: any) => {
                    const stored = (() => { try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; } })();
                    const isMe = msg.user_id === stored.id;
                    const initials = (msg.username || '?').slice(0, 2).toUpperCase();
                    return (
                      <div key={msg.id} className={`flex gap-2 chat-msg-enter ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 text-[10px] font-bold" style={{ background: msg.avatar_color || T.bronze, color: '#fff' }}>
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5 max-w-[78%]">
                          {!isMe && <span className="text-[10px] font-semibold pl-1" style={{ color: msg.avatar_color || T.textMuted }}>{msg.username}</span>}
                          <div className="px-3 py-2 text-[13px] rounded-2xl" style={isMe ? { background: T.userBubbleBg, color: T.userBubbleText, borderRadius: '1rem 0.25rem 1rem 1rem' } : { background: isDark ? `${T.card}D9` : T.card, border: `1px solid ${T.surface}44`, color: T.text, borderRadius: '0.25rem 1rem 1rem 1rem' }}>
                            {msg.message_type === 'reaction' ? <span className="text-xl">{msg.message}</span> : msg.message}
                          </div>
                          <span className="text-[9px] px-1" style={{ color: T.textDim }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={communityEndRef} className="h-2" />
                </div>
                <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none" style={{ background: `linear-gradient(to top, ${isDark ? T.pane + 'E6' : T.pane + 'F2'}, transparent)` }}></div>
              </div>
            )}

            {/* Input Area */}
            <div className="relative p-4 pb-2 flex flex-col z-10 backdrop-blur-lg transition-colors duration-300" style={{
              borderTop: `1px solid ${isDark ? T.surface + '44' : T.surface + '66'}`,
              background: isDark ? `${T.void}66` : `${T.card}99`,
            }}>

              {chatTab === 'ai' ? (
                <form onSubmit={sendMessage} className="relative flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={isInCall ? endCall : startCall}
                    disabled={(isLoading && !isInCall) || chatMode === 'human'}
                    title={isInCall ? "End call" : "Start voice call"}
                    className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all duration-300 ${isInCall ? "animate-pulse" : "disabled:opacity-40"
                      }`}
                    style={isInCall
                      ? { background: `${T.error}33`, color: T.error, border: `1px solid ${T.error}4D`, boxShadow: `0 0 15px ${T.error}66` }
                      : { background: isDark ? T.input : T.pane, color: T.textMuted, border: `1px solid ${isDark ? T.surface + '33' : T.surface + '55'}` }
                    }
                  >
                    {isInCall ? <PhoneOff className="w-4 h-4 fill-current" /> : <Phone className="w-4 h-4" />}
                  </button>

                  <div className="relative flex-1 group">
                    {isInCall ? (
                      <div
                        className="w-full rounded-full py-3 pl-5 pr-5 text-[13px] transition-all flex items-center justify-between"
                        style={{
                          background: isDark ? `${T.input}CC` : T.input,
                          border: `1px solid ${isDark ? T.surface + '44' : T.surface + '88'}`,
                          color: T.text,
                          boxShadow: isDark ? `inset 0 2px 4px rgba(0,0,0,0.3)` : `inset 0 2px 4px rgba(0,0,0,0.05)`,
                        }}
                      >
                        <span className="truncate flex-1">
                          {liveTranscript || (
                            <span className="opacity-50 italic">
                              {callStatus === "connecting" && "Connecting..."}
                              {callStatus === "listening" && "Listening..."}
                              {callStatus === "thinking" && "Thinking..."}
                              {callStatus === "speaking" && "Speaking..."}
                              {callStatus === "idle" && "Call ended"}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1 ml-2">
                          <div className={`w-2 h-2 rounded-full ${callStatus === 'listening' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <div className={`w-2 h-2 rounded-full ${callStatus === 'thinking' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <div className={`w-2 h-2 rounded-full ${callStatus === 'speaking' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${resolvedBotName}...`}
                        disabled={isLoading || isInCall}
                        className="w-full rounded-full py-3.5 pl-5 pr-14 text-[13px] focus:outline-none transition-all duration-300 disabled:opacity-50"
                        style={{
                          background: isDark ? `${T.input}CC` : T.input,
                          border: `1px solid ${isDark ? T.surface + '44' : T.surface + '88'}`,
                          color: T.text,
                          boxShadow: isDark ? `inset 0 2px 4px rgba(0,0,0,0.3)` : `inset 0 2px 4px rgba(0,0,0,0.05)`,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = `${T.bronze}80`;
                          e.currentTarget.style.background = isDark ? T.card : '#FFFFFF';
                          e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px ${T.bronze}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = isDark ? `${T.surface}44` : `${T.surface}88`;
                          e.currentTarget.style.background = isDark ? `${T.input}CC` : T.input;
                          e.currentTarget.style.boxShadow = isDark ? `inset 0 2px 4px rgba(0,0,0,0.3)` : `inset 0 2px 4px rgba(0,0,0,0.05)`;
                        }}
                      />
                    )}
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading || isInCall}
                      className="absolute right-[5px] top-[5px] bottom-[5px] min-w-[36px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background: `linear-gradient(135deg, ${T.bronze}, ${T.accent})`,
                        color: "#FDFBF7",
                        boxShadow: `0 0 12px ${T.bronze}4D`,
                      }}
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Community Input */
                <form onSubmit={(e) => { e.preventDefault(); sendCommunityMessage(); }} className="relative flex items-center gap-2 mb-2">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={communityInput}
                      onChange={(e) => setCommunityInput(e.target.value)}
                      placeholder="Say something to the community..."
                      className="w-full rounded-full py-3.5 pl-5 pr-14 text-[13px] focus:outline-none transition-all duration-300"
                      style={{
                        background: isDark ? `${T.input}CC` : T.input,
                        border: `1px solid ${isDark ? T.surface + '44' : T.surface + '88'}`,
                        color: T.text,
                        boxShadow: isDark ? `inset 0 2px 4px rgba(0,0,0,0.3)` : `inset 0 2px 4px rgba(0,0,0,0.05)`,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = `${T.bronze}80`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? `${T.surface}44` : `${T.surface}88`; }}
                    />
                    <button
                      type="submit"
                      disabled={!communityInput.trim()}
                      className="absolute right-[5px] top-[5px] bottom-[5px] min-w-[36px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: `linear-gradient(135deg, ${T.bronze}, ${T.accent})`, color: "#FDFBF7", boxShadow: `0 0 12px ${T.bronze}4D` }}
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Paiecash Footer */}
              <div className="flex justify-center items-center pb-1">
                <span className="text-[10px] font-['Quicksand'] font-medium tracking-wider uppercase flex items-center gap-1.5" style={{ color: `${T.textDim}80` }}>
                  Powered by
                  <span className="font-semibold tracking-widest text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${T.bronze}, ${T.gold})` }}>PAIECASH</span>
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}