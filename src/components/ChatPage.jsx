import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout, MdImage, MdVideoLibrary, MdAudiotrack, MdDescription, MdDownload, MdDone, MdDoneAll } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL, timeAgo } from "../config/AxiosHelper";
import { getMessagesApi } from "../services/RoomServices";
import { logoutApi, getAuthToken } from "../services/AuthServices";
import AttachmentModal from "../config/AttachmentModal";
import { getFileUrl, formatFileSize, sendAttachmentMessageApi } from "../services/AttachmentServices";
import { useReadReceipts } from "../hooks/useReadReceipts";

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
  
  // Attachment states
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  // User status states
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // 🔥 NEW: Read receipts hook
  const { getStatusIcon, getStatusColor } = useReadReceipts(
    stompClient, 
    roomId, 
    currentUser, 
    messages, 
    chatBoxRef
  );

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        const messages = await getMessagesApi(roomId);
        setMessages(messages.reverse());
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket connection
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
      client.debug = () => {};

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      client.connect(headers, () => {
        setStompClient(client);
        toast.success("Connected to chat");

        // Subscribe to room messages
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });

        // Subscribe to read receipts
        client.subscribe(`/topic/room/${roomId}/receipts`, (receipt) => {
          const data = JSON.parse(receipt.body);
          console.log('Receipt received:', data);
          
          // Update message status in UI
          setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId) {
              return { ...msg, status: data.status, readBy: data.readBy };
            }
            return msg;
          }));
        });

        // Subscribe to user status updates
        client.subscribe(`/topic/room/${roomId}/status`, (message) => {
          const status = JSON.parse(message.body);
          if (status.type === "USER_JOINED") {
            toast.success(`${status.username} joined the room`);
          } else if (status.type === "USER_LEFT") {
            toast(`${status.username} left the room`);
          }
        });

        // Subscribe to online users list
        client.subscribe(`/topic/room/${roomId}/users`, (message) => {
          const data = JSON.parse(message.body);
          setOnlineUsers(data.users || []);
        });

        // Subscribe to typing indicators
        client.subscribe(`/topic/room/${roomId}/typing`, (message) => {
          const typingData = JSON.parse(message.body);
          
          if (typingData.type === "TYPING_START") {
            setTypingUsers((prev) => {
              if (!prev.includes(typingData.username)) {
                return [...prev, typingData.username];
              }
              return prev;
            });
          } else if (typingData.type === "TYPING_STOP") {
            setTypingUsers((prev) => 
              prev.filter(u => u !== typingData.username)
            );
          }
        });

        // Subscribe to errors
        client.subscribe('/user/queue/errors', (error) => {
          try {
            const errorMsg = JSON.parse(error.body);
            toast.error(errorMsg.message || "WebSocket error");
          } catch {
            toast.error(error.body || "WebSocket error");
          }
        });

        // Announce join
        client.send(`/app/join/${roomId}`, {}, {});

      }, (error) => {
        console.error("WebSocket connection failed:", error);
        toast.error("Connection lost. Reconnecting...");
        setTimeout(connectWebSocket, 3000);
      });
    };

    if (connected && roomId) {
      connectWebSocket();
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.send(`/app/leave/${roomId}`, {}, {});
        stompClient.disconnect();
      }
    };
  }, [roomId, connected]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!stompClient || !connected || !input.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    stompClient.send(`/app/typing/start/${roomId}`, {}, {});

    typingTimeoutRef.current = setTimeout(() => {
      stompClient.send(`/app/typing/stop/${roomId}`, {}, {});
    }, 3000);
  };

  // Send text message
  const sendMessage = async () => {
    if (!stompClient || !connected || !input.trim() || sending) return;

    setSending(true);
    const message = {
      content: input,
      roomId: roomId
    };

    try {
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stompClient.send(`/app/typing/stop/${roomId}`, {}, {});
      }
      
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentSelect = async (attachmentData) => {
    setUploadingAttachment(false);
    setShowAttachmentModal(false);
    
    console.log('Attachment selected:', attachmentData);
    console.log('Current input text:', input);
    
    try {
      const toastId = toast.loading('Sending attachment...');
      
      const messageContent = input;
      
      console.log('Sending with text:', messageContent);
      
      const response = await sendAttachmentMessageApi(
        attachmentData.attachmentId,
        roomId,
        messageContent
      );
      
      console.log('Attachment message sent:', response);
      
      setInput("");
      toast.dismiss(toastId);
      toast.success('Attachment sent!');
      
    } catch (error) {
      console.error('Failed to send attachment message:', error);
      toast.error(error.response?.data?.error || 'Failed to send attachment');
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentModal(true);
    setUploadingAttachment(true);
  };

  function handleLogout() {
    if (stompClient && stompClient.connected) {
      stompClient.send(`/app/leave/${roomId}`, {}, {});
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

  const renderMessage = (message) => {
    console.log('RENDER MESSAGE:', message);

    if (message.hasAttachment) {
      if (message.attachmentType === 'image') {
        const imageUrl = getFileUrl(message.attachmentUrl);
        
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="mb-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <div className="relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={message.attachmentName || 'Image'}
                  className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(imageUrl, '_blank')}
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                  }}
                />
              ) : (
                <div className="w-64 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-white/50">Image URL not available</p>
                </div>
              )}
              <a
                href={imageUrl}
                download
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdDownload size={16} />
              </a>
            </div>
            <p className="text-xs text-white/50 mt-1">
              {message.attachmentName} • {formatFileSize(message.attachmentSize)}
            </p>
          </div>
        );
      }
      
      // Video attachment
      if (message.attachmentType === 'video') {
        const videoUrl = getFileUrl(message.attachmentUrl);
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="mb-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <video
              src={videoUrl}
              controls
              className="max-w-full max-h-64 rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-xs text-white/50 mt-1">
              {message.attachmentName} • {formatFileSize(message.attachmentSize)}
            </p>
          </div>
        );
      }
      
      // Audio attachment
      if (message.attachmentType === 'audio') {
        const audioUrl = getFileUrl(message.attachmentUrl);
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="mb-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <audio
              src={audioUrl}
              controls
              className="w-full"
            >
              Your browser does not support the audio tag.
            </audio>
            <p className="text-xs text-white/50 mt-1">
              {message.attachmentName} • {formatFileSize(message.attachmentSize)}
            </p>
          </div>
        );
      }
      
      // Document attachment
      if (message.attachmentType === 'document') {
        const docUrl = getFileUrl(message.attachmentUrl);
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="mb-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MdDescription size={24} className="text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.attachmentName}</p>
                <p className="text-xs text-white/50">{formatFileSize(message.attachmentSize)}</p>
              </div>
              <MdDownload size={20} className="text-white/50 flex-shrink-0" />
            </a>
          </div>
        );
      }
    }
    
    // Text message
    return <p className="break-words whitespace-pre-wrap">{message.content}</p>;
  };

  const otherTypingUsers = typingUsers.filter(u => u !== currentUser);

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
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 py-2 px-6 shadow-lg flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white/90">
              Room: <span className="text-[#FF9FFC]">{roomId}</span>
            </h1>
            
            <div className="flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm">{onlineUsers.length} online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((user, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800"
                  title={user}
                >
                  {user.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs border-2 border-gray-800">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">{currentUser}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white/90 transition-all duration-200"
              >
                <MdLogout size={18} />
                <span className="text-sm">Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        {otherTypingUsers.length > 0 && (
          <div className="text-white/50 text-sm italic mt-1 animate-pulse">
            {otherTypingUsers.length === 1 
              ? `${otherTypingUsers[0]} is typing...`
              : otherTypingUsers.length === 2
              ? `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`
              : `${otherTypingUsers.length} people are typing...`}
          </div>
        )}
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
          messages.map((message) => (
            <div
              key={message.id}
              data-message-id={message.id}
              data-sender={message.sender}
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
                  <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {message.sender}
                  </p>
                )}
                
                {renderMessage(message)}
                
                <div className="flex items-center justify-end gap-1 mt-2">
                  <p className="text-xs text-white/50">
                    {timeAgo(getMessageTimestamp(message))}
                  </p>
                  
                  {/* 🔥 NEW: Status indicator for sent messages */}
                  {message.sender === currentUser && (
                    <span className={`text-xs ${getStatusColor(message)}`}>
                      {getStatusIcon(message) === '✓✓✓' ? (
                        <MdDoneAll className="inline text-blue-400" size={14} />
                      ) : getStatusIcon(message) === '✓✓' ? (
                        <MdDoneAll className="inline text-green-400" size={14} />
                      ) : (
                        <MdDone className="inline text-white/50" size={14} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Input */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-t border-white/10 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-full opacity-0 group-focus-within:opacity-50 blur-md transition-all duration-300"></div>
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              placeholder="Type your message..."
              disabled={sending || uploadingAttachment}
              className="relative w-full bg-white/5 px-6 py-3 rounded-full text-white/90 placeholder-white/30 focus:outline-none border border-white/10 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAttachmentClick}
              disabled={uploadingAttachment}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white/90 transition-all duration-200 disabled:opacity-50"
              title="Attach file"
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

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => {
          setShowAttachmentModal(false);
          setUploadingAttachment(false);
        }}
        onAttachmentSelect={handleAttachmentSelect}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatPage;