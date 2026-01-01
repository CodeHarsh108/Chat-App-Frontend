import React from 'react'
import { Routes, Route } from 'react-router';   
import App from '../App.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  )
}

export default AppRoutes;