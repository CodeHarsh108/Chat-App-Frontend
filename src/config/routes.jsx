import React from "react";
import { Routes, Route, Navigate } from "react-router";
import AuthPage from "../components/AuthPage";
import RoomSelection from "../components/RoomSelection";
import ChatPage from "../components/ChatPage";
import { isAuthenticated } from "../services/AuthServices";

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route 
        path="/rooms" 
        element={
          <ProtectedRoute>
            <RoomSelection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;