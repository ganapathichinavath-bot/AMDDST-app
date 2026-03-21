import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import ProfilePage from './components/ProfilePage';
import BookingsPage from './components/BookingsPage';
import ChatPage from './components/ChatPage';
import './index.css';
import NotFoundPage from './components/NotFoundPage';
<Route path="*" element={<NotFoundPage />} />

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && !userDoc.data().profileComplete) {
          setShowProfileSetup(true);
        }
        localStorage.setItem('amddst_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
        }));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('amddst_user');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (showSplash || authLoading) return <SplashScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={currentUser} />} />
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route path="/chat" element={<ChatPage user={currentUser} isGuest={!currentUser} />} />
        <Route path="/profile" element={<ProfilePage user={currentUser} />} />
        <Route path="/bookings" element={<BookingsPage user={currentUser} />} />
      </Routes>

      {showProfileSetup && currentUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh', zIndex: 9999,
        }}>
          <ProfileSetup
            user={currentUser}
            onComplete={() => setShowProfileSetup(false)}
          />
        </div>
      )}
    </Router>
  );
}

export default App;