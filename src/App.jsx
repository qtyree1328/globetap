import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from './services/auth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Stats from './pages/Stats';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const check = () => setUser(getCurrentUser());
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/play/daily" element={user ? <Game mode="daily" user={user} /> : <Navigate to="/login" />} />
          <Route path="/play/practice" element={user ? <Game mode="practice" user={user} /> : <Navigate to="/login" />} />
          <Route path="/stats" element={user ? <Stats user={user} /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
        </Routes>
      </main>
    </div>
  );
}
