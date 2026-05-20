import { createContext, useContext, useState, useCallback } from 'react';

const ChatbotContext = createContext(null);

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbot must be used inside ChatbotProvider');
  return ctx;
}

export default function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeClubId, setActiveClubId] = useState(null);
  const [chatHistories, setChatHistories] = useState({});

  const openChat = useCallback((clubId) => {
    setActiveClubId(clubId);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setActiveClub = useCallback((clubId) => {
    setActiveClubId(clubId);
  }, []);

  const sendMessage = useCallback((clubId, text) => {
    setChatHistories(prev => ({
      ...prev,
      [clubId]: [
        ...(prev[clubId] || []),
        { role: 'user', text, timestamp: new Date() },
      ],
    }));
  }, []);

  const appendBotMessage = useCallback((clubId, text) => {
    setChatHistories(prev => ({
      ...prev,
      [clubId]: [
        ...(prev[clubId] || []),
        { role: 'bot', text, timestamp: new Date() },
      ],
    }));
  }, []);

  const clearHistory = useCallback((clubId) => {
    setChatHistories(prev => ({
      ...prev,
      [clubId]: [],
    }));
  }, []);

  const getHistory = useCallback((clubId) => {
    return chatHistories[clubId] || [];
  }, [chatHistories]);

  return (
    <ChatbotContext.Provider value={{
      isOpen,
      activeClubId,
      chatHistories,
      openChat,
      closeChat,
      setActiveClub,
      sendMessage,
      appendBotMessage,
      clearHistory,
      getHistory,
    }}>
      {children}
    </ChatbotContext.Provider>
  );
}
