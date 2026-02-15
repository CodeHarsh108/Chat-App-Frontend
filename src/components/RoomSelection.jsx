import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi, checkRoomExistsApi } from "../services/RoomServices";
import { logoutApi, getUsername } from "../services/AuthServices";
import useChatContext from "../context/ChatContext";
import LightPillar from '../design/LightPillar';
import chatIcon from "../assets/chat.png";

const RoomSelection = () => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [roomExists, setRoomExists] = useState(null);
  
  const { currentUser, setRoomId: setContextRoomId, setConnected } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!localStorage.getItem('access_token')) {
      navigate("/");
    }
  }, [navigate]);

  async function checkRoom() {
    if (!roomId.trim() || roomId.length < 3) {
      setRoomExists(null);
      return;
    }
    
    setChecking(true);
    try {
      const exists = await checkRoomExistsApi(roomId);
      setRoomExists(exists);
    } catch (error) {
      setRoomExists(false);
    } finally {
      setChecking(false);
    }
  }

  // Debounced room check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkRoom();
    }, 500);

    return () => clearTimeout(timer);
  }, [roomId]);

  async function handleJoinRoom() {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    setLoading(true);
    try {
      const room = await joinChatApi(roomId);
      toast.success(`Joined room: ${room.roomId}`);
      setContextRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || "Room not found!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom() {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    if (roomId.length < 3) {
      toast.error("Room ID must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await createRoomApi(roomId);
      toast.success(`Room created: ${response.roomId}`);
      setContextRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || "Room already exists!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logoutApi();
    setContextRoomId("");
    setConnected(false);
    navigate("/");
    toast.success("Logged out successfully");
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* LightPillar Background */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0 
      }}>
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1.2}
          rotationSpeed={0.2}
          glowAmount={0.003}
          pillarWidth={3.5}
          pillarHeight={0.5}
          noiseIntensity={0.6}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-gray-900/40 z-1"></div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
          <div className="backdrop-blur-xl bg-gray-900/80 dark:bg-gray-950/90 rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col gap-6">
            
            {/* Header with user info and logout */}
            <div className="flex justify-between items-center">
              <div className="bg-gray-800/50 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm">{currentUser}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>

            {/* Icon */}
            <div className="relative mx-auto">
              <div className="bg-gray-800/50 rounded-full p-4">
                <img src={chatIcon} className="w-14 h-14 object-contain opacity-90" alt="chat icon" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-center text-white/90">
              Join or Create Room
            </h1>
            
            <p className="text-center text-white/50 text-xs -mt-2 uppercase tracking-wider">
              Connect with others
            </p>

            {/* Room ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                Room ID
              </label>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. room123"
                  className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                />
              </div>
              
              {/* Room status indicator */}
              {roomId.trim().length >= 3 && !checking && roomExists !== null && (
                <p className={`text-xs ml-1 ${roomExists ? 'text-green-400' : 'text-yellow-400'}`}>
                  {roomExists ? '✓ Room exists' : '! Room does not exist'}
                </p>
              )}
              {checking && (
                <p className="text-white/30 text-xs ml-1 animate-pulse">Checking...</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <button
                  onClick={handleJoinRoom}
                  disabled={loading || !roomId.trim()}
                  className="relative w-full px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white/90 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : "Join Room"}
                </button>
              </div>
              
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading || !roomId.trim()}
                  className="relative w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : "Create Room"}
                </button>
              </div>
            </div>

            {/* Room ID requirements */}
            <div className="text-white/30 text-xs text-center">
              Room ID: 3-50 characters (letters, numbers, hyphens, underscores)
            </div>

            {/* Subtle divider */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-px bg-white/10"></div>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;