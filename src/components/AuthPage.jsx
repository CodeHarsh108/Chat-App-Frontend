import React, { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { loginApi, registerApi } from "../services/AuthServices";
import useChatContext from "../context/ChatContext";
import LightPillar from '../design/LightPillar';
import chatIcon from "../assets/chat.png";
import SplitText from "../design/SplitText";
import BlurText from "../design/BlurText";
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  // Handle field blur (mark as touched)
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Handle field focus (reset touched state if empty)
  const handleFieldFocus = (field) => {
    if (!formData[field]) {
      setTouchedFields(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Mark field as touched when user starts typing
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }

  function validateForm() {
    // Username validation
    if (!formData.username.trim()) {
      toast.error("Username is required!");
      return false;
    }
    
    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters!");
      return false;
    }
    
    if (formData.username.length > 20) {
      toast.error("Username must be less than 20 characters!");
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, and underscores!");
      return false;
    }
    
    // Password validation (for both login and register)
    if (!formData.password) {
      toast.error("Password is required!");
      return false;
    }
    
    // Registration-specific validations
    if (!isLogin) {
      // Email validation
      if (!formData.email) {
        toast.error("Email is required!");
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address!");
        return false;
      }
      
      // Password strength validation
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters!");
        return false;
      }
      
      if (!/(?=.*[a-z])/.test(formData.password)) {
        toast.error("Password must contain at least one lowercase letter!");
        return false;
      }
      
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        toast.error("Password must contain at least one uppercase letter!");
        return false;
      }
      
      if (!/(?=.*\d)/.test(formData.password)) {
        toast.error("Password must contain at least one number!");
        return false;
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        toast.error("Please confirm your password!");
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return false;
      }
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
        toast.success("Login successful! 🎉");
      } else {
        response = await registerApi({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        toast.success("Registration successful! 🎉");
      }
      
      setCurrentUser(response.username);
      setConnected(true);
      
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
      confirmPassword: ""
    });
    setTouchedFields({
      username: false,
      email: false,
      password: false,
      confirmPassword: false
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  // Get border class based on touched state
  const getBorderClass = (field) => {
    if (touchedFields[field] && formData[field]) {
      return "border-white/30 ring-1 ring-white/30";
    }
    return "border-white/10";
  };

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
          intensity={1.5}
          rotationSpeed={0.2}
          glowAmount={0.003}
          pillarWidth={5.0}
          pillarHeight={0.5}
          noiseIntensity={0.6}
          pillarRotation={25}
          interactive={true}
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
              {isLogin ? 
                <SplitText
                  text="Welcome Back!"
                  className="text-3xl font-semibold text-center"
                  delay={60}
                  duration={1}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                  showCallback
                />
               : 
               <BlurText
                 text="                 Create Account"
                 delay={50}
                 animateBy="words"
                 direction="top"
                 onAnimationComplete={handleAnimationComplete}
                 className="text-2xl mb-8 text-center"
               />
              }
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
                    onFocus={() => handleFieldFocus('username')}
                    onBlur={() => handleFieldBlur('username')}
                    placeholder="johndoe"
                    className={`relative w-full bg-white/5 px-4 py-2.5 border rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200 ${getBorderClass('username')}`}
                    required
                  />
                </div>
                {touchedFields.username && !formData.username && (
                  <p className="text-red-400 text-xs mt-1">Username is required</p>
                )}
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
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="john@example.com"
                      className={`relative w-full bg-white/5 px-4 py-2.5 border rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200 ${getBorderClass('email')}`}
                      required={!isLogin}
                    />
                  </div>
                  {touchedFields.email && !formData.email && (
                    <p className="text-red-400 text-xs mt-1">Email is required</p>
                  )}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('password')}
                    onBlur={() => handleFieldBlur('password')}
                    placeholder="••••••••"
                    className={`relative w-full bg-white/5 px-4 py-2.5 border rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200 ${getBorderClass('password')}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {touchedFields.password && !formData.password && (
                  <p className="text-red-400 text-xs mt-1">Password is required</p>
                )}
                {!isLogin && touchedFields.password && formData.password && formData.password.length < 6 && (
                  <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password - only for registration */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg opacity-0 focus-within:opacity-50 blur-md transition-all duration-300"></div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => handleFieldFocus('confirmPassword')}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      placeholder="••••••••"
                      className={`relative w-full bg-white/5 px-4 py-2.5 border rounded-lg focus:outline-none focus:border-transparent focus:ring-0 placeholder-white/30 text-white/90 text-sm transition-all duration-200 ${getBorderClass('confirmPassword')}`}
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {touchedFields.confirmPassword && !formData.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Please confirm your password</p>
                  )}
                  {touchedFields.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Password strength indicator for registration */}
              {!isLogin && formData.password && (
                <div className="space-y-1 mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-red-500/30'}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-500' : 'bg-red-500/30'}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-red-500/30'}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${/(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-red-500/30'}`}></div>
                  </div>
                  <p className="text-white/30 text-xs">
                    Password must contain: 6+ chars, uppercase, lowercase, number
                  </p>
                </div>
              )}

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