import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/auth';

export default function Login({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return setError('Fill in all fields');
    const result = isSignup ? signup(username.trim(), password) : login(username.trim(), password);
    if (result.error) return setError(result.error);
    setUser(result.user);
    nav('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-4">
      <form onSubmit={handleSubmit} className="animate-fade-in bg-[#0d1b2a] border border-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? 'Create Account' : 'Sign In'}
        </h2>

        {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 mb-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 mb-6 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-600"
        />

        <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 rounded-lg transition-all">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-cyan-400 hover:underline">
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
}
