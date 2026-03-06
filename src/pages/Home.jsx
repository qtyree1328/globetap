import { Link } from 'react-router-dom';
import { getUserGames } from '../services/db';
import { getTodayString } from '../services/game';

export default function Home({ user }) {
  const todayPlayed = user && getUserGames(user.username).some(g => g.date === getTodayString() && g.mode === 'daily');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
      <div className="animate-fade-in text-center max-w-lg">
        <div className="text-7xl mb-6">🌍</div>
        <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
          GlobeTap
        </h1>
        <p className="text-slate-400 mb-10 text-lg">
          Tap the globe. Find the place. How well do you know the world?
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          {user ? (
            <>
              <Link
                to="/play/daily"
                className={`py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  todayPlayed
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed pointer-events-none'
                    : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white animate-pulse-glow'
                }`}
              >
                {todayPlayed ? '✓ Daily Complete' : '▶ Daily Challenge'}
              </Link>
              <Link
                to="/play/practice"
                className="py-4 px-6 rounded-xl font-bold text-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-700 text-slate-300 hover:text-white transition-all"
              >
                🔄 Practice Mode
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white"
            >
              Sign In to Play
            </Link>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">5</div>
            <div className="text-xs text-slate-500">Rounds</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400">5000</div>
            <div className="text-xs text-slate-500">Max Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">500+</div>
            <div className="text-xs text-slate-500">Locations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
