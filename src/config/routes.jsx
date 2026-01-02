import React from 'react'
import { Routes, Route } from 'react-router';   
import App from '../App.jsx';
import { ChatPage } from '../components/ChatPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default AppRoutes;