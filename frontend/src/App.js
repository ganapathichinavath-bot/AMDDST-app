import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './pages/ProfileSetup';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

function App() {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={currentUser} />} />
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route path="/chat" element={<ChatPage user={currentUser} isGuest={!currentUser} />} />
        <Route path="/profile" element={<ProfilePage user={currentUser} />} />
        <Route path="/bookings" element={<BookingsPage user={currentUser} />} />
        <Route path="/confirm" element={<BookingConfirmPage user={currentUser} />} />
        <Route path="*" element={<NotFoundPage />} />
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