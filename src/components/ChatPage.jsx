import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL, timeAgo } from "../config/AxiosHelper";
import { getMessagesApi } from "../services/RoomServices";
import { logoutApi, getAuthToken } from "../services/AuthServices";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!connected || !currentUser || !roomId) {
      navigate("/rooms");
    }
  }, [connected, currentUser, roomId, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        const messages = await getMessagesApi(roomId);
        setMessages(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }
    
    if (connected && roomId) {
      loadMessages();
    }
  }, [roomId, connected]);

  // Auto-scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection
 // In ChatPage.jsx - update the WebSocket connection useEffect

useEffect(() => {
  const connectWebSocket = () => {
    const token = getAuthToken();
    
    if (!token) {
      toast.error("Not authenticated");
      handleLogout();
      return;
    }

    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);

    // Disable logging in production
    client.debug = () => {};

    // IMPORTANT: Headers must be set exactly like this
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    client.connect(headers, 
      // Success callback
      () => {
        setStompClient(client);
        toast.success("Connected to chat");

        // Subscribe to room messages
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const newMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          } catch (e) {
            console.error("Error parsing message:", e);
          }
        });

        // Subscribe to user-specific errors
        client.subscribe('/user/queue/errors', (error) => {
          try {
            const errorMsg = JSON.parse(error.body);
            toast.error(errorMsg.message || "WebSocket error");
          } catch {
            toast.error(error.body || "WebSocket error");
          }
        });
      }, 
      // Error callback
      (error) => {
        console.error("WebSocket connection failed:", error);
        
        // Check if it's an auth error
        if (error.headers && error.headers.message) {
          if (error.headers.message.includes("Authentication")) {
            toast.error("Authentication failed. Please login again.");
            handleLogout();
          } else {
            toast.error("Connection lost. Reconnecting...");
            // Retry after 3 seconds
            setTimeout(connectWebSocket, 3000);
          }
        } else {
          toast.error("Connection lost. Reconnecting...");
          setTimeout(connectWebSocket, 3000);
        }
      }
    );
  };

  if (connected && roomId) {
    connectWebSocket();
  }

  return () => {
    if (stompClient) {
      stompClient.disconnect();
    }
  };
}, [roomId, connected]);

  // Send message
  const sendMessage = async () => {
    if (!stompClient || !connected || !input.trim() || sending) return;

    setSending(true);
    const message = {
      content: input,
      roomId: roomId
      // sender is set from authenticated user on backend
    };

    try {
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  function handleLogout() {
    if (stompClient) {
      stompClient.disconnect();
    }
    logoutApi();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
    toast.success("Logged out");
  }

  const getMessageTimestamp = (message) => {
    return message.timestamp || message.timeStamp || message.createdAt;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white/50 animate-pulse">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 py-4 px-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white/90">
            Room: <span className="text-[#FF9FFC]">{roomId}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm">{currentUser}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white/90 transition-all duration-200"
          >
            <MdLogout size={18} />
            <span className="text-sm">Leave</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(82, 39, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 159, 252, 0.05) 0%, transparent 50%)'
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/30 text-lg">No messages yet</p>
              <p className="text-white/20 text-sm mt-2">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[70%] md:max-w-[50%] rounded-2xl p-4 ${
                  message.sender === currentUser
                    ? "bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] text-white"
                    : "bg-white/10 text-white/90 border border-white/10"
                }`}
              >
                {message.sender !== currentUser && (
                  <p className="text-xs text-white/50 mb-1">{message.sender}</p>
                )}
                <p className="break-words">{message.content}</p>
                <p className="text-xs text-white/50 mt-1 text-right">
                  {timeAgo(getMessageTimestamp(message))}
                </p>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Input */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-full opacity-0 group-focus-within:opacity-50 blur-md transition-all duration-300"></div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              placeholder="Type your message..."
              disabled={sending}
              className="relative w-full bg-white/5 px-6 py-3 rounded-full text-white/90 placeholder-white/30 focus:outline-none border border-white/10 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white/90 transition-all duration-200 disabled:opacity-50"
              disabled
              title="File upload coming soon"
            >
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-3 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;