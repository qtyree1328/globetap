import { Link, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Navbar({ user, setUser }) {
  const loc = useLocation();
  const active = (path) => loc.pathname === path ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200';

  return (
    <nav className="bg-[#0a1628]/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          GlobeTap
        </span>
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className={active('/')}>Home</Link>
        <Link to="/leaderboard" className={active('/leaderboard')}>Leaderboard</Link>
        {user && <Link to="/stats" className={active('/stats')}>Stats</Link>}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-cyan-300 text-xs">{user.username}</span>
            <button
              onClick={() => { logout(); setUser(null); }}
              className="text-slate-500 hover:text-red-400 text-xs"
            >Logout</button>
          </div>
        ) : (
          <Link to="/login" className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
