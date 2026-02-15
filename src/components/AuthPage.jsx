import React, { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { loginApi, registerApi } from "../services/AuthServices";
import useChatContext from "../context/ChatContext";
import LightPillar from '../design/LightPillar';
import chatIcon from "../assets/chat.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    displayName: ""
  });
  const [loading, setLoading] = useState(false);
  
  const { setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleInputChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  function validateForm() {
    if (!formData.username || !formData.password) {
      toast.error("Username and password are required!");
      return false;
    }
    
    if (!isLogin && !formData.email) {
      toast.error("Email is required for registration!");
      return false;
    }
    
    if (!isLogin && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }
    
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let response;
      
      if (isLogin) {
        response = await loginApi({
          username: formData.username,
          password: formData.password
        });
        toast.success("Login successful!");
      } else {
        response = await registerApi({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || formData.username
        });
        toast.success("Registration successful!");
      }
      
      // Set user in context
      setCurrentUser(response.username);
      setConnected(true);
      
      // Navigate to room selection
      navigate("/rooms");
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                       error.response?.data || 
                       (isLogin ? "Login failed" : "Registration failed");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
    setFormData({
      username: "",
      email: "",
      password: "",
      displayName: ""
    });
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
            
            {/* Icon */}
            <div className="relative mx-auto">
              <div className="bg-gray-800/50 rounded-full p-4">
                <img src={chatIcon} className="w-14 h-14 object-contain opacity-90" alt="chat icon" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-center text-white/90">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h1>
            
            <p className="text-center text-white/50 text-xs -mt-2 uppercase tracking-wider">
              {isLogin ? "Sign in to continue" : "Join the conversation"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email - only for registration */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Display Name - only for registration */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                    Display Name (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="relative w-full bg-white/5 px-4 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="relative group mt-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-70 group-hover:opacity-100 blur-md transition-all duration-300"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg text-white/90 text-sm font-medium transition-all duration-200 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                </button>
              </div>
            </form>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={toggleMode}
                className="text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
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

export default AuthPage;