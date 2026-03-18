import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        } />
        <Route path="/chat" element={
          isLoggedIn
            ? <ChatPage />
            : <ChatPage />
        } />
      </Routes>
    </Router>
  );
}

export default App;