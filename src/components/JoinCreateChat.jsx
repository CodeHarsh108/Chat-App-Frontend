import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomServices";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import LightPillar from '../design/LightPillar';

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
    useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("joined..");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log("Join error:", error);
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data || "Room not found!");
        } else {
          toast.error("Error joining room");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      console.log(detail);
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room Created Successfully !!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room already exists !!");
        } else {
          toast("Error in creating room");
        }
      }
    }
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

      {/* Dark gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-gray-900/40 z-1"></div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
          {/* Darker glass morphism card */}
          <div className="backdrop-blur-xl bg-gray-900/80 dark:bg-gray-950/90 rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col gap-6">
            
            {/* Minimal icon - removed gradients and animations */}
            <div className="relative mx-auto">
              <div className="bg-gray-800/50 rounded-full p-4">
                <img src={chatIcon} className="w-14 h-14 object-contain opacity-90" alt="chat icon" />
              </div>
            </div>

            {/* Simple white title */}
            <h1 className="text-2xl font-semibold text-center text-white/90">
              Join or Create Room
            </h1>
            
            {/* Minimal subtitle */}
            <p className="text-center text-white/50 text-xs -mt-2 uppercase tracking-wider">
              Connect with others
            </p>

            {/* Name input - with pillar-colored focus halo */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                <input
                  onChange={handleFormInputChange}
                  value={detail.userName}
                  type="text"
                  id="name"
                  name="userName"
                  placeholder="e.g. john"
                  className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Room ID input - with pillar-colored focus halo */}
            <div className="space-y-1.5">
              <label htmlFor="roomId" className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                Room ID
              </label>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                <input
                  name="roomId"
                  onChange={handleFormInputChange}
                  value={detail.roomId}
                  type="text"
                  id="roomId"
                  placeholder="e.g. room123"
                  className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Minimal buttons with pillar-colored glow on hover */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <button
                  onClick={joinChat}
                  className="relative w-full px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white/90 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-transparent"
                >
                  Join Room
                </button>
              </div>
              
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <button
                  onClick={createRoom}
                  className="relative w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-transparent"
                >
                  Create Room
                </button>
              </div>
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

export default JoinCreateChat;