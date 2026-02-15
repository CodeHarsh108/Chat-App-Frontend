import { createContext, useContext, useState, useEffect } from "react";
import { getUsername } from "../services/AuthServices";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(localStorage.getItem('roomId') || "");
  const [currentUser, setCurrentUser] = useState(getUsername());
  const [connected, setConnected] = useState(false);

  // Sync roomId to localStorage
  useEffect(() => {
    if (roomId) {
      localStorage.setItem('roomId', roomId);
    } else {
      localStorage.removeItem('roomId');
    }
  }, [roomId]);

  // Update currentUser from localStorage on mount
  useEffect(() => {
    setCurrentUser(getUsername());
  }, []);

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        setRoomId,
        setCurrentUser,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export default useChatContext;